# Skolar · School Supplies Shop

A simple, modern web shop for school supplies with a product management panel.
Customers browse the catalogue, search, filter by category, fill a cart and place an order
(payment on delivery). An admin signs in to manage products, categories, stock and orders.

**Tech stack:** Spring Boot 4 · Spring Data JPA · Spring Security · MySQL · React 19 · Vite · React Router

## Features

**Storefront (public)**
- Hero, category chips and instant search
- Product cards with emoji or image covers, "Popular" tag and stock labels (in stock / only N left / sold out)
- Product detail dialog with quantity picker
- Cart drawer saved in the browser, checkout form with validation, order confirmation
- Stock is checked and reduced when an order is placed

**Admin panel (`/admin`, HTTP Basic login)**
- Dashboard: product count, low-stock count, new orders, revenue, latest orders, "running low" list
- Products: add / edit / delete, price, stock, category, emoji and card colour, optional image URL, featured flag
- Categories: add / edit / delete (a category with products cannot be deleted)
- Orders: filter by status, view details, move an order through NEW → PROCESSING → SHIPPED → DELIVERED, or cancel (stock is returned)

## Project structure

```
school-supplies-shop/
├── backend/                 # Spring Boot REST API (port 8080)
│   └── src/main/java/com/skolar/shop/
│       ├── model/           # Category, Product, CustomerOrder, OrderItem
│       ├── repository/      # Spring Data JPA repositories
│       ├── web/             # REST controllers + JSON error handling
│       ├── config/          # Security (HTTP Basic + CORS), demo data seeder
│       └── dto/             # Request records with validation
└── frontend/                # React + Vite (port 5173)
    └── src/
        ├── pages/Storefront.jsx     # shop, cart, checkout
        ├── pages/admin/             # login, dashboard, products, categories, orders
        ├── api.js                   # fetch wrapper + admin credentials
        └── cart.jsx                 # cart state (localStorage)
```

## API

| Method | Path | Who |
|---|---|---|
| GET | `/api/products?category=slug&q=text` | public |
| GET | `/api/products/{id}` | public |
| GET | `/api/categories` | public |
| POST | `/api/orders` | public |
| POST / PUT / DELETE | `/api/products`, `/api/products/{id}` | admin |
| POST / PUT / DELETE | `/api/categories`, `/api/categories/{id}` | admin |
| GET | `/api/orders`, `/api/orders/{id}` | admin |
| PATCH | `/api/orders/{id}/status` | admin |
| GET | `/api/stats`, `/api/auth/me` | admin |

Admin requests use HTTP Basic authentication. Unauthorised calls get a JSON 401 without a
`WWW-Authenticate` header, so the browser never shows its own login popup.

## Running locally

**Requirements:** Java 17+, MySQL 8, Node.js 18+. Maven is downloaded automatically by the wrapper.

### 1. Backend
The database `school_supplies` is created automatically on first start and seeded with demo products.

```bash
cd backend
# Windows PowerShell
$env:DB_USER="root"; $env:DB_PASSWORD="your_mysql_password"; .\mvnw spring-boot:run
# macOS / Linux
DB_USER=root DB_PASSWORD=your_mysql_password ./mvnw spring-boot:run
```

Optional settings (environment variables): `DB_HOST`, `DB_PORT`, `DB_NAME`, `PORT`,
`ADMIN_USER` / `ADMIN_PASSWORD` (default `admin` / `admin123`, change them before deploying),
`CORS_ORIGINS`, `APP_SEED=false` to skip the demo data.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. The admin panel is at http://localhost:5173/admin.
Set `VITE_API_URL` if the API is not on `http://localhost:8080/api`.

## Author
Rinarda Lahu · [github.com/RinardaL](https://github.com/RinardaL)
