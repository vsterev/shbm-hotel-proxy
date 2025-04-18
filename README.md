# SHBM Hotel Proxy

This service is part of the **Solvex Hotel Booking Manager** system. It acts as a backend proxy that connects to external hotel APIs to:

- Send and receive hotel bookings
- Change booking statuses
- Manage authentication and validation
- Handle hotel service integrations

---

## 🔧 Tech Stack

- **Node.js**
- **Express**
- **TSOA** – TypeScript OpenAPI tooling
- **Passport.js** – Authentication middleware
- **JWS** – JSON Web Signature (JWT variant)
- **Swagger** – API documentation

---

## 🚀 Features

- 🌐 Communicates with 3rd-party hotel APIs
- 🔄 Syncs booking status and updates in real-time
- 🧾 Swagger-based API documentation
- 🔐 JWT/JWS-secured endpoints via Passport
- 🧩 Modular architecture with TSOA
- 🌱 Environment-based configuration
- 🧠 TypeScript for safety and scalability

---

## 📦 Local Development

1. **Install Redis (if not already installed)**

```bash
sudo apt update
sudo apt install redis-server
```

Enable and start Redis:

```bash
sudo systemctl enable redis
sudo systemctl start redis
```

To check if Redis is running:

```bash
redis-cli ping
```

2. **Clone the repo**

   ```bash
   git clone git@github.com:vsterev/shbm-hotel-proxy.git
   cd shbm-hotel-proxy
   ```

3. **Install dependencies**

   ```bash
   yarn
   ```

4. **Setup environment**
   Copy example.env to .env and configure your values.

   ```bash
   cp .example.env .env
   ```

5. **Run in dev mode**

```bash
   yarn dev
```

6. **Build for production**

```bash
yarn build
```

## 📁 Deployment with PM2

We use PM2 for production deployment.

Setup (first time) on server:

```bash
pm2 deploy ecosystem.config.cjs production setup
```

Deploy updates run locally:

```bash
pm2 deploy ecosystem.config.cjs production
```

Make sure ecosystem.config.cjs includes your deployment config and app definition.

## 🔐 Authentication

This service uses JWS (JSON Web Signature) tokens validated via Passport.js middleware.

Tokens must be included in the Authorization:

```js
Bearer < token > header;
```

Custom auth strategies can be added in auth/passport.ts.

## 📚 Swagger API Docs

After starting the app, Swagger docs will be available at:

```bash
http://localhost:<PORT>/docs

```

These docs are automatically generated from TSOA decorators.

## 📄 License

MIT License © 2025 Vasil St.

## 🧠 Part of

Solvex Hotel Booking Manager – Internal toolset for managing hotel reservations, APIs, availability sync, and more.
