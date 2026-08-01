[Tiếng Việt](#tiếng-việt) | [English](#english-version)

---

<a name="tiếng-việt"></a>
# 📚 Quản lý Mượn Sách (BOOKWORM)

## 📖 Giới thiệu
Bookworm là một hệ thống quản lý mượn trả sách thư viện được thiết kế dành cho độc giả và quản trị viên, cung cấp giao diện trực quan và các chức năng toàn diện cho việc tìm kiếm sách, quản lý giỏ hàng, mượn trả và theo dõi lịch sử mượn. Dự án này được phát triển dựa trên cấu trúc MEVN stack (MongoDB, Express, Vue.js, Node.js).

## ✨ Tính năng
**Dành cho người dùng (Độc giả):**
- Đăng ký, đăng nhập và cập nhật thông tin tài khoản cá nhân.
- Tìm kiếm sách, xem thông tin chi tiết của sách.
- Thêm sách vào giỏ hàng, cập nhật số lượng và xóa khỏi giỏ.
- Gửi yêu cầu mượn sách.
- Xem lịch sử mượn sách và lịch sử yêu cầu mượn sách.

**Dành cho quản trị viên (Admin):**
- Quản lý danh mục sách (Thêm, Sửa, Xóa).
- Quản lý thông tin độc giả.
- Theo dõi và xử lý các yêu cầu mượn/trả sách (Duyệt, Từ chối).
- Quản lý mượn - trả sách.
- Xem thống kê trực quan với biểu đồ.

## 🛠️ Công nghệ sử dụng

- **Frontend**: VueJS
- **Backend**: NodeJS
- **Database**: MongoDB
- **Development Tools**: Visual Studio Code
- **Deployment**: Github

## 🚀 Hướng dẫn cài đặt

### Yêu cầu tiên quyết
- Máy tính có cài đặt Node.js 
- Máy tính có cài đặt MongoDB.

### Các bước cài đặt
1. **Clone repository:**
   ```bash
   git clone https://github.com/minhthu2404/BookWorm.git
   cd BookWorm
   ```

2. **Cài đặt thư viện cho Backend:**
   ```bash
   npm install
   ```

3. **Cài đặt thư viện cho Frontend:**
   ```bash
   cd client
   npm install
   ```

## 💡 Hướng dẫn sử dụng

1. **Khởi động Backend:**
   Mở terminal tại thư mục gốc của dự án (`BookWorm`) và chạy lệnh:
   ```bash
   npm start
   ```
   *Backend sẽ chạy tại cổng là http://localhost:3000.*

2. **Khởi động Frontend:**
   Mở một terminal mới tại thư mục `client` và chạy lệnh:
   ```bash
   npm run dev
   ```
   *Truy cập vào đường dẫn http://localhost:5173 trên trình duyệt*

## 🏗️ Thiết kế hệ thống
- **Kiến trúc:** Client-Server. Frontend giao tiếp với Backend thông qua các API RESTful để thực hiện logic nghiệp vụ và thao tác với dữ liệu.
- **Cơ sở dữ liệu:** Hệ thống sử dụng MongoDB để lưu trữ dữ liệu với các collection chính như: Người dùng (NGUOIDUNG), Sách (SACH), Giỏ hàng (GIOHANG), Đơn mượn (DONMUON), Yêu cầu (YEUCAU), Chi tiết giỏ hàng (CHITIET_GIOHANG), Chi tiết đơn mượn (CHITIET_DONMUON) và Chi tiết yêu cầu (CHITIET_YEUCAU). Dịch vụ backend đã được tinh chỉnh để tối ưu hóa việc tái sử dụng code.

## 🏆 Kết quả đạt được
- Xây dựng thành công hệ thống quản lý mượn sách có khả năng thực hiện đầy đủ các tác vụ cốt lõi từ đăng ký mượn đến xử lý trả sách.
- Triển khai thành công giao diện tương tác đẹp mắt, có thông báo trạng thái rõ ràng (Toastify) và các chức năng hiển thị dữ liệu trực quan, dễ sử dụng.
- Đạt được hiểu biết chuyên sâu về kết nối Frontend và Backend trong ứng dụng thực tế.

## 🔗 Tài liệu tham khảo
- [Vue.js Official Documentation](https://vuejs.org/guide/introduction.html)
- [Node.js Official Documentation](https://nodejs.org/en/docs/)
- [Express.js Official Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 👩‍💻 Tác giả

- **Student:** Trần Minh Thư – MSSV: B2303851
- **Supervisor:** Ths. Nguyễn Minh Trung
- **University:** Can Tho University – School of Information and Communication Technology

---

## 📜 Giấy phép

This project is for **academic purposes** at Can Tho University.

Dự án này phục vụ **mục đích học tập** tại Đại học Cần Thơ.

---
<a name="english-version"></a>
# 📚 Book Borrowing Management (BOOKWORM)

## 📖 Introduction
Bookworm is a library book borrowing and returning management system designed for readers and administrators, providing an intuitive interface and comprehensive functions for book searching, cart management, borrowing/returning, and borrowing history tracking. This project is developed based on the MEVN stack architecture (MongoDB, Express, Vue.js, Node.js).

## ✨ Features
**For Users (Readers):**
- Register, login, and update personal account information.
- Search for books, view detailed book information.
- Add books to the cart, update quantity, and remove from cart.
- Send book borrowing requests.
- View book borrowing history and borrowing request history.

**For Administrators (Admin):**
- Manage book catalog (Add, Edit, Delete).
- Manage reader information.
- Track and process book borrowing/returning requests (Approve, Reject).
- Manage book borrowing and returning.
- View visual statistics with charts.

## 🛠️ Technologies Used

- **Frontend**: VueJS
- **Backend**: NodeJS
- **Database**: MongoDB
- **Development Tools**: Visual Studio Code
- **Deployment**: Github

## 🚀 Installation Guide

### Prerequisites
- Computer with Node.js installed.
- Computer with MongoDB installed.

### Installation Steps
1. **Clone repository:**
   ```bash
   git clone https://github.com/minhthu2404/BookWorm.git
   cd BookWorm
   ```

2. **Install Backend dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend dependencies:**
   ```bash
   cd client
   npm install
   ```

## 💡 Usage Guide

1. **Start Backend:**
   Open a terminal in the root directory of the project (`BookWorm`) and run the command:
   ```bash
   npm start
   ```
   *The backend will run on port http://localhost:3000.*

2. **Start Frontend:**
   Open a new terminal in the `client` directory and run the command:
   ```bash
   npm run dev
   ```
   *Access the URL http://localhost:5173 on your browser.*

## 🏗️ System Design
- **Architecture:** Client-Server. Frontend communicates with Backend via RESTful APIs to handle business logic and data manipulation.
- **Database:** The system uses MongoDB for data storage with main collections such as: Users (NGUOIDUNG), Books (SACH), Cart (GIOHANG), Borrowing Orders (DONMUON), Requests (YEUCAU), Cart Details (CHITIET_GIOHANG), Borrowing Order Details (CHITIET_DONMUON), and Request Details (CHITIET_YEUCAU). The backend service has been refined to optimize code reusability.

## 🏆 Achievements
- Successfully built a book borrowing management system capable of performing all core tasks from borrowing registration to returning processing.
- Successfully implemented a beautiful interactive interface, with clear status notifications (Toastify) and visual, easy-to-use data display functions.
- Gained in-depth knowledge of Frontend and Backend connectivity in real-world applications.

## 🔗 References
- [Vue.js Official Documentation](https://vuejs.org/guide/introduction.html)
- [Node.js Official Documentation](https://nodejs.org/en/docs/)
- [Express.js Official Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 👩‍💻 Author

- **Student:** Trần Minh Thư – Student ID: B2303851
- **Supervisor:** MSc. Nguyễn Minh Trung
- **University:** Can Tho University – School of Information and Communication Technology

---

## 📜 License

This project is for **academic purposes** at Can Tho University.

Dự án này phục vụ **mục đích học tập** tại Đại học Cần Thơ.
