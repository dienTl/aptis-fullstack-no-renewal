# Aptis key

Hệ thống luyện thi Aptis lấy cảm hứng từ AptisKey.

## Công nghệ

- Backend: Java 17, Spring Boot 3, Spring Security + JWT, JPA, MySQL, Redis cache, WebSocket
- Frontend: React, Vite, React Router, Axios, Tailwind CSS

## Cách chạy

Khởi động MySQL local. Ứng dụng sẽ tạo/sử dụng database tên `aptis_fullstack_no_renewal`.

Cấu hình database mặc định:

- Tên đăng nhập: `root`
- Mật khẩu: để trống

Nếu MySQL có mật khẩu, hãy set trước khi chạy backend:

```powershell
$env:DB_PASSWORD="your_mysql_password"
```

Redis là tùy chọn khi phát triển local. Cache mặc định dùng bộ nhớ trong. Để dùng Redis cache:

```powershell
$env:CACHE_TYPE="redis"
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:8080

Swagger: http://localhost:8080/swagger-ui/index.html

Admin mặc định:

- Email: `admin@aptis.local`
- Password: `admin123`
