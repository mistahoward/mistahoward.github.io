# Portfolio Monorepo

A modern portfolio website built with Preact frontend and C# WebAssembly backend running on Cloudflare Workers.

## 🏗️ Architecture

- **Frontend**: Preact + Vite (React-like framework with fast build times)
- **Backend**: C# compiled to WebAssembly running on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite-based)
- **Type Safety**: Shared TypeScript interfaces generated from C# models

## 📁 Project Structure

```
mistahoward.github.io/
├── frontend/          # Preact frontend application
├── backend/           # C# WASI backend
├── package.json       # Root package.json for monorepo orchestration
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+)
2. **.NET 8 SDK**
3. **Wasmer** (for local WASI runtime)
4. **Wrangler CLI** (for Cloudflare Workers)

### Installation

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev
```

This will:
- Start the Preact dev server (typically on `http://localhost:5173`)
- Start the Cloudflare Worker dev server (typically on `http://localhost:8787`)
- Watch for C# changes and rebuild WASM automatically
- Generate TypeScript types from C# models

### Individual Commands

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build everything
npm run build

# Clean all build artifacts
npm run clean
```

## 🔧 Development Workflow

1. **Frontend Development**: Edit files in `frontend/src/`
2. **Backend Development**: Edit C# files in `backend/`
3. **Type Generation**: TypeScript interfaces are automatically generated from C# models
4. **Local Testing**: Use `wasmer` to test the WASM module locally

## 📚 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both projects
- `npm run install:all` - Install dependencies for all projects
- `npm run clean` - Clean all build artifacts

### Frontend (`frontend/`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (`backend/`)
- `npm run dev:full` - Full development mode with WASM watching
- `npm run build:wasm` - Build C# to WebAssembly
- `npm run build:types` - Generate TypeScript types
- `npm run dev:worker` - Start Wrangler dev server only

## 🌐 API Endpoints

- `GET /` - Returns a list of projects as JSON
- CORS enabled for local development

## 🗄️ Database

The project uses Cloudflare D1 with the following schema:

```sql
CREATE TABLE Projects (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

1. **Create D1 database**:
   ```bash
   wrangler d1 create portfolio-db-preview
   ```

2. **Update database ID** in `backend/wrangler.toml`

3. **Apply migrations**:
   ```bash
   wrangler d1 migrations apply portfolio-db-preview
   ```

4. **Deploy to Cloudflare**:
   ```bash
   wrangler deploy
   ```

## 🛠️ Tech Stack

- **Frontend**: Preact, Vite, TypeScript
- **Backend**: C# (.NET 8), WebAssembly, Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Type Generation**: TypeGen
- **Development**: Concurrently, Wrangler, Wasmer

## 📝 License

MIT 