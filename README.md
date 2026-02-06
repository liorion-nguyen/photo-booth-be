# Photobooth Backend

API NestJS kết nối PostgreSQL và lưu ảnh trên Cloudinary.

## Yêu cầu

- Node.js 18+
- PostgreSQL
- Tài khoản [Cloudinary](https://cloudinary.com) (miễn phí)

## Cài đặt

```bash
cd photobooth-be
npm install
cp example.env .env
# Chỉnh .env với thông tin DB và Cloudinary của bạn
```

## Biến môi trường (.env)

| Biến | Mô tả |
|------|--------|
| `PORT` | Cổng chạy API (mặc định 3001) |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Kết nối PostgreSQL |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary (Dashboard → Account) |
| `CORS_ORIGIN` | Origin frontend (ví dụ `http://localhost:3000`) |

## Chạy

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

API chạy tại: `http://localhost:3001`

## API

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/photos/upload` | Upload ảnh (form field: `photo`) → trả về `{ url, id }` |
| GET | `/api/photos` | Danh sách ảnh |
| GET | `/api/photos/:id` | Chi tiết ảnh |
| DELETE | `/api/photos/:id` | Xóa ảnh (DB + Cloudinary) |

## Tạo database PostgreSQL

```bash
createdb photobooth
# hoặc trong psql:
# CREATE DATABASE photobooth;
```

Schema bảng `photos` được tạo tự động khi chạy (synchronize: true trong development).
