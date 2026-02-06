# Photobooth Backend - Vercel Deployment

Backend NestJS được deploy trên Vercel sử dụng serverless functions.

## 📁 Cấu trúc

- `api/index.ts` - Serverless function adapter cho NestJS
- `vercel.json` - Cấu hình Vercel
- `.vercelignore` - Files/folders bị ignore khi deploy

## 🚀 Deploy

Xem hướng dẫn chi tiết tại [VERCEL_DEPLOY.md](../VERCEL_DEPLOY.md)

### Quick Start

1. Cài đặt dependencies:
```bash
npm install
```

2. Deploy qua Vercel CLI:
```bash
vercel
```

Hoặc import project qua Vercel Dashboard và chọn thư mục `photobooth-be`.

## ⚙️ Environment Variables

Đảm bảo đã set tất cả các biến môi trường trong Vercel Dashboard:
- Database (PostgreSQL)
- JWT secrets
- Cloudinary credentials
- SMTP settings
- OAuth credentials (Google, Facebook)
- CORS origins

Xem chi tiết trong `example.env` và [VERCEL_DEPLOY.md](../VERCEL_DEPLOY.md).

## 🔧 Build

Vercel sẽ tự động build khi deploy. Build command: `npm run build`

## 📝 Notes

- NestJS app được wrap trong Express adapter để tương thích với Vercel serverless functions
- App instance được cache để giảm cold start time
- Tất cả routes được route qua `api/index.ts`
