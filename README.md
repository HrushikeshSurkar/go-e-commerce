# Go E-Commerce Full-Stack Platform

Enterprise full-stack e-commerce solution powered by a high-performance **Go REST API** and two 100% native client applications (**Angular Web Client** & **Native Android Mobile App**).

---

## ⚡ How to Run (Quick Start)

### Option 1: One-Click Runner (PowerShell)
```powershell
.\run-all.ps1
```

### Option 2: Run Separately

#### 1. Backend (Go REST API)
```powershell
cd backend
go run main.go
```
*API runs at `http://localhost:8080` (Healthcheck: `http://localhost:8080/health`).*

#### 2. Website (Angular 20 Standalone)
```powershell
cd frontend/website
npm start
```
*Web store runs at `http://localhost:4200`.*

---

## 🔑 Demo Accounts & Pre-Seeded Data

The PostgreSQL database (`ecommerce` on port 5433) is pre-seeded with catalog categories, products, inventory, and test accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@ecommerce.com` | `Customer@123` | Browse catalog, add to cart, place orders |
| **Admin** | `admin@ecommerce.com` | `Admin@123` | Manage products, update order status |

### Pre-loaded Categories & Products:
1. **Electronics**: *SonicPro Wireless ANC Headphones* ($299.99), *UltraMechanical Wireless Keyboard* ($159.50), *Precision Ergonomic Laser Mouse* ($89.00).
2. **Apparel & Wearables**: *AeroFit Minimalist Merino Hoodie* ($120.00), *Urban Commuter Waterproof Backpack* ($110.00).
3. **Home & Living**: *Artisan Ceramic Coffee Dripper & Mug* ($48.00).

#### 3. Mobile App (Native Android)
1. Open **Android Studio**.
2. Select **Open** and choose the `frontend/mobile-app` directory.
3. Wait for Gradle sync to complete and click the **Run (▶)** button on an Emulator or connected device.

---

## 🏗️ Architecture & Technology Stack

| Component | Platform | Technologies | Key Highlights |
| :--- | :--- | :--- | :--- |
| **Backend** | Server | Go 1.27, Gin, GORM, PostgreSQL, JWT, Bcrypt | Atomic order transactions, password hashing, role auth, REST API |
| **Website** | Web Browser | Angular 20, TypeScript, Signals, SCSS (BEM) | Standalone components, OnPush change detection, zero bloated libraries |
| **Mobile App** | Native Android | Kotlin 2.1, Jetpack Compose, Material 3, Retrofit 2 | 100% Native (0% React Native / Ionic), StateFlow, MVVM, Coil image loader |

---

## 📁 Repository Structure

```
go-e-commerce/
├── backend/                  # Go REST API (Gin + GORM + PostgreSQL)
├── frontend/
│   ├── website/              # Angular 20 standalone client (Signals + SCSS BEM)
│   └── mobile-app/           # Android Studio native project (Kotlin + Compose)
├── run-all.ps1               # PowerShell one-click launch script
├── PROJECT_INFO.md           # In-depth architectural & API documentation
└── README.md                 # Project README
```

For complete API documentation, database schemas, and architectural breakdowns, see [PROJECT_INFO.md](file:///d:/all%20Projects/Projects/2026/FullStack/go-e-commerce/PROJECT_INFO.md).
