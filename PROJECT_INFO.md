# How to Run Everything (Quick Start)

Run these 3 commands in 3 separate terminals:

```powershell
# 1. Backend (Go REST API - port 8080)
cd backend
go run main.go
```

```powershell
# 2. Website (Angular Web App - port 4200)
cd frontend/website
npm start
```

```powershell
# 3. Android App (Native Android Studio)
# Open the "frontend/mobile-app" folder in Android Studio and press the green "Run" (▶) button.
```

Or run everything with one click using the runner script:
```powershell
.\run-all.ps1
```

---

# Project Overview & Architecture

Full-stack, high-performance E-Commerce platform built with a unified Go backend powering two 100% native client applications (Web and Android).

```
                            ┌────────────────────────────────────────┐
                            │          Go Backend (REST API)         │
                            │  Go 1.27 • Gin • GORM • PostgreSQL/JWT │
                            └───────────────────┬────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │       Angular Website       │                   │     Native Android App      │
        │      (100% Native Web)      │                   │   (100% Native Android)     │
        │ Angular 20 • Signals • SCSS │                   │ Kotlin • Jetpack Compose M3 │
        │         BEM Pattern         │                   │     Retrofit 2 • StateFlow  │
        └─────────────────────────────┘                   └─────────────────────────────┘
```

---

## 1. Backend (`backend/`)

- **Language & Runtime**: Go 1.27+
- **HTTP Framework**: Gin Web Framework
- **ORM & Database**: GORM with PostgreSQL driver (automatic fallback to in-memory mode if DB is offline)
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt password hashing
- **Environment**: Managed via `.env` / `godotenv`
- **Port**: `8080`

### API Endpoints:
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Healthcheck probe |
| `POST` | `/api/v1/auth/register` | Public | Register new user |
| `POST` | `/api/v1/auth/login` | Public | Login & receive Bearer JWT |
| `GET` | `/api/v1/auth/profile` | Authenticated | Current user profile |
| `GET` | `/api/v1/categories` | Public | List product categories |
| `POST` | `/api/v1/categories` | Admin | Create category |
| `GET` | `/api/v1/products` | Public | Filter/search catalog |
| `GET` | `/api/v1/products/:id` | Public | Single product details |
| `POST` | `/api/v1/products` | Admin | Create product |
| `PUT` | `/api/v1/products/:id` | Admin | Update product |
| `DELETE` | `/api/v1/products/:id` | Admin | Delete product |
| `POST` | `/api/v1/orders` | Authenticated | Place order (atomic stock deduction) |
| `GET` | `/api/v1/orders/my-orders` | Authenticated | List customer orders |
| `GET` | `/api/v1/orders` | Admin | List all orders |
| `PATCH`| `/api/v1/orders/:id/status`| Admin | Update order status |

---

## 2. Website (`frontend/website/`)

- **Framework**: Angular 20+ Standalone Architecture
- **State Management**: Angular Signals (`signal`, `computed`, `effect`)
- **Styling**: SCSS with strict **BEM (Block Element Modifier)** methodology & design tokens
- **Change Detection**: `ChangeDetectionStrategy.OnPush`
- **Interceptors**: Functional `authInterceptor` adding `Authorization: Bearer <token>`
- **Routing**: Client-side Angular router
- **Unit Testing**: Angular TestBed + Jasmine (`npm test`)

---

## 3. Mobile App (`frontend/mobile-app/`)

- **Platform**: 100% Native Android (ART / JVM bytecode)
- **Language**: Kotlin 2.1
- **UI Toolkit**: Jetpack Compose with Material 3 (Material You)
- **Networking**: Retrofit 2 + OkHttp 3 (with logging interceptor)
- **Architecture**: MVVM with Kotlin Coroutines and `StateFlow`
- **Image Loading**: Coil Compose for asynchronous caching
- **Base URL**: `http://10.0.2.2:8080/api/v1/` (Points to host machine Go API from Android Emulator)

---

## Directory Structure

```
go-e-commerce/
├── backend/                  # Go REST API
│   ├── config/               # DB connection & env loading
│   ├── controllers/          # Request handlers (auth, products, orders)
│   ├── middleware/           # JWT verification & CORS
│   ├── models/               # GORM entities
│   ├── routes/               # API routes
│   ├── utils/                # Password hashing, JWT signing & tests
│   └── main.go               # Server entry point
│
├── frontend/
│   ├── website/              # Angular 20 Standalone Web App
│   │   ├── src/app/
│   │   │   ├── core/         # Interceptors, Models, and Signal Services
│   │   │   ├── app.ts        # Storefront component (Signals, OnPush)
│   │   │   ├── app.html      # Declarative BEM template
│   │   │   └── app.scss      # BEM stylesheet with design tokens
│   │   └── package.json
│   │
│   └── mobile-app/           # Native Android Studio Project
│       ├── app/
│       │   └── src/main/java/com/goecommerce/app/
│       │       ├── data/     # Retrofit ApiService & Models
│       │       ├── ui/       # Compose screens & ViewModels
│       │       └── MainActivity.kt
│       ├── build.gradle.kts
│       └── settings.gradle.kts
│
├── run-all.ps1               # PowerShell one-click launcher
├── PROJECT_INFO.md           # This comprehensive document
└── README.md                 # Root workspace documentation
```
