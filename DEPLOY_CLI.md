# Deploy Backend lên Vercel bằng CLI

Hướng dẫn deploy backend NestJS lên Vercel sử dụng Vercel CLI.

## 📋 Yêu cầu

1. **Cài đặt Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Đăng nhập Vercel**:
   ```bash
   vercel login
   ```

## 🚀 Các bước deploy

### Bước 1: Di chuyển vào thư mục backend

```bash
cd photobooth-be
```

### Bước 2: Cài đặt dependencies (nếu chưa có)

```bash
npm install
```

### Bước 3: Deploy lên Vercel

#### Deploy Preview (Testing):
```bash
vercel
```

#### Deploy Production:
```bash
vercel --prod
```

Lần đầu tiên deploy, Vercel sẽ hỏi một số câu hỏi:
- **Set up and deploy?** → `Y`
- **Which scope?** → Chọn account/team của bạn
- **Link to existing project?** → `N` (lần đầu) hoặc `Y` (nếu đã có project)
- **Project name?** → `photobooth-be` (hoặc tên bạn muốn)
- **Directory?** → `.` (thư mục hiện tại)
- **Override settings?** → `N` (sử dụng vercel.json)

### Bước 4: Set Environment Variables

Sau khi deploy, bạn cần set environment variables trong Vercel Dashboard hoặc bằng CLI:

#### Cách 1: Qua Vercel Dashboard
1. Vào https://vercel.com/dashboard
2. Chọn project `photobooth-be`
3. Vào **Settings** → **Environment Variables**
4. Thêm các biến môi trường cần thiết

#### Cách 2: Qua CLI (từng biến)

```bash
# Database
vercel env add DATABASE_URL production
# Hoặc
vercel env add DB_HOST production
vercel env add DB_PORT production
vercel env add DB_USERNAME production
vercel env add DB_PASSWORD production
vercel env add DB_DATABASE production

# JWT
vercel env add JWT_SECRET production
vercel env add JWT_EXPIRES_IN production

# CORS
vercel env add CORS_ORIGIN production
vercel env add FRONTEND_URL production

# Cloudinary
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production

# SMTP
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_SECURE production
vercel env add SMTP_USER production
vercel env add SMTP_PASS production
vercel env add SMTP_FROM production

# OAuth
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_CALLBACK_URL production

vercel env add FACEBOOK_APP_ID production
vercel env add FACEBOOK_APP_SECRET production
vercel env add FACEBOOK_CALLBACK_URL production

# Server
vercel env add NODE_ENV production
vercel env add PORT production
```

#### Cách 3: Import từ file .env (nếu có)

```bash
# Tạo file .env.production với các giá trị
# Sau đó import (Vercel CLI không hỗ trợ trực tiếp, cần dùng Dashboard hoặc từng biến)
```

### Bước 5: Redeploy sau khi set env vars

Sau khi set environment variables, cần redeploy:

```bash
vercel --prod
```

## 📝 Sử dụng script tự động

Tôi đã tạo script `deploy.sh` để tự động hóa quá trình:

```bash
# Cấp quyền thực thi
chmod +x deploy.sh

# Deploy preview
./deploy.sh

# Deploy production
./deploy.sh --prod
```

## 🔍 Kiểm tra deployment

Sau khi deploy thành công, bạn sẽ nhận được URL:
- **Preview**: `https://photobooth-be-xxx.vercel.app`
- **Production**: `https://photobooth-be.vercel.app` (hoặc custom domain)

Kiểm tra health:
```bash
curl https://your-backend-url.vercel.app/auth/me
```

## 🔄 Cập nhật và redeploy

Mỗi khi có thay đổi code:

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

Hoặc nếu đã link với Git:
- Push code lên branch `main` → Tự động deploy production
- Push code lên branch khác → Tự động deploy preview

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@nestjs/core'"
```bash
npm install
```

### Lỗi: "Build failed"
- Kiểm tra logs trong Vercel Dashboard
- Đảm bảo `vercel.json` đúng cấu hình
- Kiểm tra TypeScript errors: `npm run build`

### Lỗi: "Database connection failed"
- Kiểm tra environment variables đã được set chưa
- Đảm bảo database cho phép connections từ Vercel IPs
- Kiểm tra `DATABASE_URL` hoặc các biến `DB_*` đúng format

### Lỗi: "CORS error"
- Kiểm tra `CORS_ORIGIN` đã set đúng URL frontend chưa
- Đảm bảo URL không có trailing slash

## 📚 Lệnh Vercel CLI hữu ích

```bash
# Xem thông tin project
vercel ls

# Xem logs
vercel logs

# Xem environment variables
vercel env ls

# Xóa environment variable
vercel env rm VARIABLE_NAME production

# Xem thông tin deployment
vercel inspect [deployment-url]

# Xóa project
vercel remove
```

## 🔗 Tài liệu tham khảo

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
