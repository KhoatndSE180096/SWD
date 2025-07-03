import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";
import Sidebar from "../../components/ManagerSidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "../../utils/axiosInstance";
import moment from "moment";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all"); // Thêm trạng thái filter
  const [stats, setStats] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [mostOrderedServiceId, setMostOrderedServiceId] = useState(null);
  const [mostOrderedServiceName, setMostOrderedServiceName] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    day: moment().format("YYYY-MM-DD"),
    month: moment().month() + 1, // 1-12
    year: moment().year(),
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        console.log(response.data); // Kiểm tra dữ liệu trả về
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);





  useEffect(() => {
    if (orders.length === 0) return;

    let filteredOrders = [...orders];

    // Lọc theo trạng thái nếu có lựa chọn
    if (statusFilter !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === statusFilter
      );
    }

    // Lọc theo ngày/tháng/năm
    if (filter === "day") {
      filteredOrders = filteredOrders.filter((order) =>
        moment(order.transactionDateTime).isSame(moment(selectedDate.day), "day")
      );
    } else if (filter === "month") {
      filteredOrders = filteredOrders.filter((order) =>
        moment(order.transactionDateTime).month() + 1 === selectedDate.month &&
        moment(order.transactionDateTime).year() === selectedDate.year
      );
    } else if (filter === "year") {
      filteredOrders = filteredOrders.filter((order) =>
        moment(order.transactionDateTime).year() === selectedDate.year
      );
    }

    // Tính toán thống kê
    const newStats = {};
    let revenueSum = 0;
    let orderCount = 0;
    const serviceCount = {}; // Để đếm số lần xuất hiện của mỗi serviceId

    filteredOrders.forEach((order) => {
      const revenue = order.amount || 0;
      revenueSum += revenue;
      orderCount += 1;

      const orderDate = moment(order.transactionDateTime);
      const month = orderDate.month() + 1;
      if (!newStats[month]) {
        newStats[month] = { revenue: 0, count: 0 };
      }
      newStats[month].revenue += revenue;
      newStats[month].count += 1;

      // Đếm số lần xuất hiện của mỗi serviceId
      const serviceId = order.serviceId;
      if (!serviceCount[serviceId]) {
        serviceCount[serviceId] = 0;
      }
      serviceCount[serviceId] += 1;
    });

    setStats(newStats);
    setTotalRevenue(revenueSum);
    setTotalOrders(orderCount);

    // Tìm 5 dịch vụ được đặt nhiều nhất
    const sortedServices = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1]) // Sắp xếp theo số lần đặt
      .slice(0, 5); // Top 5 dịch vụ

    // Gọi API để lấy tên các dịch vụ được đặt nhiều nhất
    Promise.all(
      sortedServices.map(async ([serviceId, count]) => {
        try {
          const res = await fetch(`/api/services/${serviceId}`);
          const data = await res.json();
          return {
            serviceId,
            name: data.name,
            count,
          };
        } catch (err) {
          return {
            serviceId,
            name: "Unknown Service",
            count,
          };
        }
      })
    ).then((top) => {
      setTopServices(top);
    });
  }, [orders, filter, selectedDate, statusFilter]);





  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "#f4f4f4" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>

        {/* Bộ lọc */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <TextField
              select
              label="Filter By"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </TextField>
          </Grid>

          {/* Bộ lọc theo ngày, tháng, năm */}
          {filter === "day" && (
            <Grid item xs={4}>
              <TextField
                label="Select Date"
                type="date"
                value={selectedDate.day}
                onChange={(e) => setSelectedDate({ ...selectedDate, day: e.target.value })}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          )}

          {filter === "month" && (
            <Grid item xs={4}>
              <TextField
                select
                label="Select Month"
                value={selectedDate.month}
                onChange={(e) => setSelectedDate({ ...selectedDate, month: e.target.value })}
                fullWidth
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {filter === "year" && (
            <Grid item xs={4}>
              <TextField
                select
                label="Select Year"
                value={selectedDate.year}
                onChange={(e) => setSelectedDate({ ...selectedDate, year: e.target.value })}
                fullWidth
              >
                {[2023, 2024, 2025].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* Bộ lọc theo trạng thái */}
          <Grid item xs={4}>
            <TextField
              select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Tổng quan nhanh */}
        <Grid container spacing={1} sx={{ mb: 4 }}>
          {/* Tổng Doanh Thu và Đơn Hàng */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4A90E2' }}>
                  Total Revenue
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {totalRevenue.toLocaleString()} VND
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#E91E63' }}>
                  Total Orders
                </Typography>
                <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Biểu đồ doanh thu và đơn hàng */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                  Monthly Revenue
                </Typography>
                <Bar
                  data={{
                    labels: Object.keys(stats).map((m) => {
                      const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
                      return monthNames[m - 1];
                    }),
                    datasets: [
                      {
                        label: "Revenue (VND)",
                        data: Object.values(stats).map((s) => s.revenue),
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: {
                      x: { ticks: { font: { weight: 'bold' } } },
                      y: { ticks: { font: { weight: 'bold' } } },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                  Monthly Total Orders
                </Typography>
                <Bar
                  data={{
                    labels: Object.keys(stats).map((m) => {
                      const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
                      return monthNames[m - 1];
                    }),
                    datasets: [
                      {
                        label: "Total Orders",
                        data: Object.values(stats).map((s) => s.count),
                        backgroundColor: "rgba(255, 99, 132, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: {
                      x: { ticks: { font: { weight: 'bold' } } },
                      y: { ticks: { font: { weight: 'bold' } } },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Top Ordered Services */}
          <Grid item xs={12}>
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                  Top Ordered Services
                </Typography>
                {topServices.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    No orders yet.
                  </Typography>
                ) : (
                  topServices.map((service, index) => (
                    <Box
                      key={service.serviceId}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        borderBottom: "1px solid #eee",
                        '&:hover': {
                          backgroundColor: '#f9f9f9',
                          cursor: 'pointer',
                          borderRadius: 1,
                          boxShadow: 1,
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: '500' }}>
                        {index + 1}. {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.count} bookings
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
