# Aptis key

Practice app for Aptis-style exam preparation.

## Stack

- Backend: Java 17, Spring Boot 3, Spring Security + JWT, JPA, MySQL
- Frontend: React, Vite, React Router, Axios, Tailwind CSS

## Run Locally

Start local MySQL first. The app uses database `aptis_fullstack_no_renewal`.

Default database config:

- Username: `root`
- Password: `demo123`

If your MySQL password is different, set it before starting the backend:

```powershell
$env:DB_PASSWORD="your_mysql_password"
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

Default admin:

- Email: `admin@aptis.local`
- Password: `admin123`
