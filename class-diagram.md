# Class Diagram - Skin Care Consultation System

```mermaid
classDiagram
    class User {
        -UserId: String
        -FirstName: String
        -LastName: String
        -Email: String
        -Password: String
        -RoleName: String
        -PhoneNumber: String
        -Verified: Boolean
        -CreatedDate: Date
        -UpdatedDate: Date
        +Register()
        +Login()
        +VerifyEmail()
        +UpdateProfile()
        +ChangePassword()
    }

    class Consultant {
        -ConsultantId: String
        -UserId: String
        -Note: String
        -Image: String
        -Certifications: String[]
        -Category: String[]
        -CreatedAt: Date
        -UpdatedAt: Date
        +CreateConsultant()
        +UpdateProfile()
        +GetAvailableSlots()
        +AssignToBooking()
    }

    class Service {
        -ServiceId: String
        -Name: String
        -Price: Double
        -Description: String
        -Image: String
        -Category: String[]
        -Status: String
        -CreatedAt: Date
        +CreateService()
        +UpdateService()
        +GetRecommendedServices()
        +ActivateService()
    }

    class BookingRequest {
        -BookingId: String
        -ServiceId: String
        -CustomerId: String
        -ConsultantId: String
        -Date: Date
        -Time: String
        -Status: String
        -CheckinCode: String
        -CreatedDate: Date
        +CreateBooking()
        +AssignConsultant()
        +UpdateStatus()
        +GenerateCheckinCode()
    }

    class Order {
        -OrderId: String
        -MemberId: String
        -ServiceId: String
        -OrderCode: String
        -Amount: Double
        -Status: String
        -PaymentMethod: String
        -TransactionDate: Date
        +CreateOrder()
        +ProcessPayment()
        +UpdateStatus()
        +CalculateTotal()
    }

    class Payment {
        -PaymentId: String
        -OrderId: String
        -Amount: Double
        -PaymentMethod: String
        -PaymentDate: Date
        -Status: String
        +ProcessPayment()
        +ValidatePayment()
    }

    class QuizResult {
        -QuizResultId: String
        -UserId: String
        -SkinType: String
        -CreatedDate: Date
        +SaveResult()
        +CalculateSkinType()
        +GetRecommendations()
        +GetAnswers()
    }

    class Question {
        -QuestionId: String
        -QuestionText: String
        +CreateQuestion()
        +UpdateQuestion()
        +AddAnswerOption()
        +RemoveAnswerOption()
    }

    class AnswerOption {
        -OptionId: String
        -QuestionId: String
        -AnswerText: String
        -Weight: Integer
        +CreateOption()
        +UpdateOption()
        +DeleteOption()
    }

    class Answer {
        -AnswerId: String
        -QuizResultId: String
        -QuestionId: String
        -AnswerText: String
        -Weight: Integer
        +SelectAnswer()
        +ValidateAnswer()
    }
    }

    class Feedback {
        -FeedbackId: String
        -BookingId: String
        -ServiceId: String
        -ConsultantId: String
        -ServiceRating: Integer
        -ConsultantRating: Integer
        -ServiceComment: String
        -ConsultantComment: String
        -CreatedDate: Date
        +CreateFeedback()
        +UpdateRating()
        +ValidateBooking()
    }

    class Blog {
        -BlogId: String
        -Title: String
        -Image: String
        -Description: String
        -Content: String
        -CreatedDate: Date
        -Availability: Boolean
        +CreateBlog()
        +UpdateBlog()
        +PublishBlog()
        +ArchiveBlog()
    }

    %% Relationships
    User ||--o| Consultant : "1..1 extends 0..1"
    User ||--o{ BookingRequest : "1..1 creates 0..*"
    User ||--o{ Order : "1..1 places 0..*"
    User ||--o{ QuizResult : "1..1 takes 0..*"

    Consultant ||--o{ BookingRequest : "0..1 assigned to 0..*"

    Service ||--o{ BookingRequest : "1..1 booked for 1..*"
    Service ||--o{ Order : "1..1 ordered in 1..*"
    Service ||--o{ Feedback : "1..1 rated in 0..*"

    BookingRequest ||--o| Order : "1..1 payment for 0..1"
    BookingRequest ||--o| Feedback : "1..1 receives 0..1"

    Consultant ||--o{ Feedback : "1..1 evaluated in 0..*"

    Order ||--|| Payment : "1..1 generates 1..1"

    Question ||--o{ AnswerOption : "1..1 contains 1..*"
    QuizResult ||--o{ Answer : "1..1 stores 1..*"
    Answer ||--|| Question : "1..1 references 1..1"
    Answer ||--|| AnswerOption : "1..1 selects 1..1"

    %% Notes
    note for User "RoleName: Customer, Staff, Manager, Consultant, Admin"
    note for Service "Category: Oily, Dry, Combination, Normal"
    note for BookingRequest "Status: Pending, Confirmed, Completed, Cancelled"
    note for Order "Status: Pending, Paid, Canceled"
```

## Giải thích Class Diagram - Skin Care Consultation System

### Các thực thể chính:

1. **User**: Người dùng hệ thống với các vai trò khác nhau
2. **Consultant**: Chuyên gia tư vấn (mở rộng từ User)
3. **Service**: Dịch vụ chăm sóc da
4. **BookingRequest**: Yêu cầu đặt lịch dịch vụ
5. **Order**: Đơn hàng thanh toán
6. **Payment**: Thông tin thanh toán
7. **QuizResult**: Kết quả quiz đánh giá loại da
8. **Question**: Câu hỏi trong quiz
9. **AnswerOption**: Lựa chọn trả lời cho câu hỏi
10. **Answer**: Câu trả lời đã chọn trong quiz
11. **Feedback**: Đánh giá dịch vụ và consultant
12. **Blog**: Bài viết/tin tức về chăm sóc da

### Mối quan hệ chính:

- **User → Consultant** (1..1 - 0..1): Một User có thể là Consultant (không bắt buộc)
- **User → BookingRequest** (1..1 - 0..\*): Một user có thể tạo nhiều booking
- **User → Order** (1..1 - 0..\*): Một user có thể đặt nhiều đơn hàng
- **User → QuizResult** (1..1 - 0..\*): Một user có thể làm nhiều quiz
- **Consultant → BookingRequest** (0..1 - 0..\*): Một consultant có thể được phân công nhiều booking
- **Service → BookingRequest** (1..1 - 1..\*): Một dịch vụ có thể được đặt nhiều lần
- **Service → Order** (1..1 - 1..\*): Một dịch vụ có thể có nhiều đơn hàng
- **Service → Feedback** (1..1 - 0..\*): Một dịch vụ có thể nhận nhiều feedback
- **BookingRequest → Order** (1..1 - 0..1): Một booking có thể có một đơn hàng thanh toán
- **BookingRequest → Feedback** (1..1 - 0..1): Một booking có thể nhận một feedback
- **Consultant → Feedback** (1..1 - 0..\*): Một consultant có thể nhận nhiều feedback
- **Order → Payment** (1..1 - 1..1): Mỗi đơn hàng tạo ra một payment
- **Question → AnswerOption** (1..1 - 1..\*): Mỗi câu hỏi có nhiều lựa chọn trả lời
- **QuizResult → Answer** (1..1 - 1..\*): Một quiz result có nhiều câu trả lời
- **Answer → Question** (1..1 - 1..1): Mỗi câu trả lời tham chiếu đến một câu hỏi
- **Answer → AnswerOption** (1..1 - 1..1): Mỗi câu trả lời chọn một option cụ thể

### Các thuộc tính quan trọng:

- **User.RoleName**: Phân biệt Customer, Staff, Manager, Consultant, Admin
- **Service.Category**: Phân loại theo loại da (Oily, Dry, Combination, Normal)
- **BookingRequest.Status**: Trạng thái đặt lịch (Pending, Confirmed, Completed, Cancelled)
- **Order.Status**: Trạng thái thanh toán (Pending, Paid, Canceled)
- **QuizResult.SkinType**: Kết quả phân loại da từ quiz

### Quy trình nghiệp vụ chính:

1. **Đăng ký/Đăng nhập**: User tạo tài khoản và xác thực
2. **Làm Quiz**: User làm quiz để xác định loại da
3. **Xem dịch vụ**: Hệ thống gợi ý dịch vụ phù hợp với loại da
4. **Đặt lịch**: User tạo BookingRequest cho dịch vụ
5. **Thanh toán**: Tạo Order và xử lý Payment
6. **Phân công**: Manager/Staff phân công Consultant
7. **Thực hiện dịch vụ**: Consultant thực hiện dịch vụ
8. **Đánh giá**: Customer để lại Feedback
