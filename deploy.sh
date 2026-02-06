#!/bin/bash

# Script deploy Backend lên Vercel
# Usage: ./deploy.sh [--prod]

set -e

echo "🚀 Deploying Photobooth Backend to Vercel..."

# Kiểm tra Vercel CLI đã được cài đặt chưa
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI chưa được cài đặt!"
    echo "📦 Cài đặt bằng: npm i -g vercel"
    exit 1
fi

# Kiểm tra đã login Vercel chưa
if ! vercel whoami &> /dev/null; then
    echo "🔐 Chưa đăng nhập Vercel. Đang mở trình duyệt để đăng nhập..."
    vercel login
fi

# Di chuyển vào thư mục backend
cd "$(dirname "$0")"

# Kiểm tra dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Đang cài đặt dependencies..."
    npm install
fi

# Kiểm tra file .env
if [ ! -f ".env" ]; then
    echo "⚠️  Cảnh báo: File .env không tồn tại!"
    echo "📝 Vui lòng tạo file .env từ example.env và điền các giá trị cần thiết"
    echo "💡 Hoặc set environment variables trong Vercel Dashboard sau khi deploy"
fi

# Deploy
if [ "$1" == "--prod" ]; then
    echo "🌐 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🧪 Deploying to PREVIEW..."
    vercel
fi

echo "✅ Deploy hoàn tất!"
echo ""
echo "📝 Lưu ý:"
echo "   1. Đảm bảo đã set tất cả environment variables trong Vercel Dashboard"
echo "   2. Kiểm tra URL backend được tạo ra"
echo "   3. Cập nhật CORS_ORIGIN và FRONTEND_URL với URL frontend của bạn"
echo ""
echo "🔗 Xem project tại: https://vercel.com/dashboard"
