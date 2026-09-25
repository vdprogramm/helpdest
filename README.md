# Hệ thống Helpdesk (Hỗ trợ khách hàng trực tuyến)

Dự án Helpdesk là một giải pháp toàn diện bao gồm cả **Frontend** và **Backend** nhằm giúp các doanh nghiệp quản lý yêu cầu hỗ trợ (Tickets), tương tác trực tiếp với khách hàng thông qua tính năng Live Chat (Real-time), cũng như thống kê và quản lý nhân viên (Agent).

---

## 🌟 Các tính năng chính

- **Quản lý Tickets:** Khách hàng có thể tạo yêu cầu hỗ trợ (Ticket), hệ thống sẽ phân bổ cho các phòng ban (Department) hoặc nhân viên (Agent) tương ứng.
- **Live Chat (Real-time):** Hỗ trợ chat trực tuyến giữa Khách hàng và Agent theo thời gian thực nhờ công nghệ WebSockets.
- **Xác thực & Phân quyền:** Phân quyền rõ ràng giữa Khách hàng, Nhân viên hỗ trợ (Agent) và Quản trị viên (Admin).
- **Câu trả lời mẫu (Canned Responses):** Giúp Agent phản hồi nhanh chóng bằng các mẫu câu có sẵn theo từng phòng ban.
- **Báo cáo & Thống kê (Dashboard):** Hiển thị số liệu trực quan về lượng ticket, hiệu suất của Agent (thông qua biểu đồ).

---

## 🚀 Công nghệ sử dụng

Dự án được chia thành 2 phần chính với các công nghệ hiện đại:

### 1. Frontend (Giao diện người dùng)
- **Framework/Library:** React.js 19, Vite
- **Ngôn ngữ:** TypeScript
- **Quản lý State:** Zustand
- **Routing:** React Router v7
- **Giao tiếp Real-time:** Socket.IO Client
- **Fetch API:** Axios
- **Biểu đồ & Icon:** Recharts, Lucide React

### 2. Backend (Máy chủ & API)
- **Framework:** NestJS (Node.js)
- **Ngôn ngữ:** TypeScript
- **Cơ sở dữ liệu:** PostgreSQL
- **ORM:** Prisma
- **Real-time Engine:** Socket.IO, Redis (Pub/Sub & Caching)
- **Bảo mật & Xác thực:** JWT, Passport, Bcrypt

---

## 📁 Cấu trúc thư mục tổng quan

```text
Helpdesk/
├── helpdesk-frontend/      # Mã nguồn Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Các UI components dùng chung
│   │   ├── pages/          # Các trang (Dashboard, Chat, Tickets...)
│   │   ├── store/          # Zustand store quản lý state
│   │   └── ...
│   └── package.json
│
└── helpdesk-backend/       # Mã nguồn Backend (NestJS + Prisma)
    ├── src/
    │   ├── auth/           # Module xác thực
    │   ├── chat/           # WebSocket Gateway
    │   ├── tickets/        # REST API cho Ticket
    │   └── ...
    ├── prisma/             # Schema và Seed data cho PostgreSQL
    └── package.json
```

---

## 🛠️ Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản 18+ hoặc 20+)
- [PostgreSQL](https://www.postgresql.org/) (Đang chạy tại local hoặc cloud)
- [Redis](https://redis.io/) (Đang chạy tại local)

### Bước 1: Thiết lập Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd helpdesk-backend
   ```
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   Tạo file `.env` từ `.env.example` (nếu có) và điền thông tin:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/helpdesk?schema=public"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET="secret_key"
   JWT_EXPIRES_IN="1d"
   ```
4. Khởi tạo Database với Prisma:
   ```bash
   npx prisma db push
   npm run seed  # (Nạp dữ liệu mẫu)
   ```
5. Chạy server backend:
   ```bash
   npm run start:dev
   # Backend sẽ chạy ở cổng mặc định (ví dụ: http://localhost:3000)
   ```

### Bước 2: Thiết lập Frontend

1. Mở một Terminal khác, di chuyển vào thư mục frontend:
   ```bash
   cd helpdesk-frontend
   ```
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   Tạo file `.env` và trỏ về API của backend:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_SOCKET_URL=http://localhost:3000
   ```
4. Chạy ứng dụng frontend:
   ```bash
   npm run dev
   # Frontend sẽ chạy trên cổng http://localhost:5173
   ```

🎉 **Bây giờ bạn có thể truy cập http://localhost:5173 để sử dụng hệ thống!**
