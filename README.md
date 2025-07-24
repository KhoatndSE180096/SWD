# VelvetySpa - Booking & Management Platform

A modern, full-stack web application designed for spa service booking, user & staff management, and consultant operations. Built using the MERN stack with a focus on performance, security, and great user experience.---

## 🚀 Features

- User registration, login, and email verification
- Role-based access: Customer, Staff, Consultant, Manager, Admin
- Password reset via email
- Booking management for customers and staff
- Feedback, blog, and service management modules
- Responsive, modern UI with professional Google login button
- Secure JWT authentication
- Environment variable support for easy deployment

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Axios, React Toastify
- **Backend:** Node.js, Express, MongoDB, Mongoose, google-auth-library, Nodemailer
- **Authentication:** JWT, Google OAuth2
- **Deployment:** Vercel/Netlify (Frontend), Render/Heroku (Backend)

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/velvetyspa.git
cd velvetyspa
```

### 2. Setup environment variables

- Copy `.env.example` to `.env` in both `client/` and `server/` folders and fill in your credentials.

### 3. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 4. Run the app locally

- **Backend:**
  ```bash
  cd server
  npm run dev
  ```
- **Frontend:**
  ```bash
  cd client
  npm run dev
  ```

- Visit: [http://localhost:5173](http://localhost:5173)

---

## 📦 Project Structure

```
client/         # React frontend (Vite)
server/         # Node.js backend (Express, MongoDB)
```

---

## 🛡️ Security Notes

- Do NOT commit your real `.env` files. Use `.env.example` for sharing config structure.
- All passwords are hashed, JWT is used for authentication.
- Google login auto-creates users with unique phone numbers to avoid duplicate key errors.

---

## 💡 Contribution

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

**Enjoy building your spa platform!**
