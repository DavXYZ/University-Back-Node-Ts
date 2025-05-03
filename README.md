# Polytechnic-Back Project

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL
- TypeScript

### Installation
```bash
# 1. Clone the repository
git clone ------

# 2. Install dependencies
npm install
```
# 3. Setup environment
create .env file

# ========================
# REQUIRED SETTINGS
# ========================

# Server Configuration
PORT=5000
NODE_ENV=development # or "production"

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=polytechnic
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_32+_chars
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRATION=30m
JWT_REFRESH_EXPIRATION_SHORT=1d
JWT_REFRESH_EXPIRATION_LONG=30d

# ========================
# AUTHENTICATION SERVICES
# ========================

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/callback

# Email SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password

# ========================
# SECURITY SETTINGS
# ========================
SESSION_SECRET=your_session_secret_32+_chars
COOKIE_KEY1=your_cookie_key1_32+_chars
COOKIE_KEY2=your_cookie_key2_32+_chars

# ========================
# CLIENT CONFIGURATION
# ========================
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000

# ========================
# THIRD-PARTY SERVICES
# ========================

# Hunter.io Email Verification
HUNTER_IO_API=your_hunter_api_key

# Redis Configuration
REDIS_HOST=redis
REDIS_URL=redis://localhost:6379

# Translation Services
TRANSLATION_SERVICE=google # Options: google, deepl, azure, mock
GOOGLE_TRANSLATE_API_KEY=your_google_key
DEEPL_API_KEY=your_deepl_key
AZURE_TRANSLATOR_KEY=your_azure_key
AZURE_TRANSLATOR_REGION=your_azure_region


```bash
npm run generate-ormconfig
npm run migration:generate -- src/migrations/YourMigrationName  # Generate new migration
npm run migration:run       # Run pending migrations
npm run dev
```