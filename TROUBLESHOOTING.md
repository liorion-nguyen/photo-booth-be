# Troubleshooting Database Connection Issues

## Lỗi: `getaddrinfo ENOTFOUND ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech`

### Nguyên nhân có thể:
1. **Network connectivity** - Không có kết nối internet hoặc bị chặn
2. **DNS resolution** - Không thể resolve hostname của Neon
3. **DATABASE_URL sai format** - Connection string không đúng
4. **Firewall/VPN** - Bị chặn bởi firewall hoặc VPN

### Giải pháp:

#### 1. Kiểm tra DATABASE_URL trong .env

Đảm bảo DATABASE_URL có format đúng:
```env
DATABASE_URL=postgresql://username:password@ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

Hoặc nếu dùng individual config:
```env
DB_HOST=ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

#### 2. Test kết nối từ terminal

```bash
# Test DNS resolution
nslookup ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech

# Test connection với psql
psql "postgresql://username:password@ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech/dbname?sslmode=require"
```

#### 3. Kiểm tra network

```bash
# Ping để test connectivity
ping ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech

# Test port
telnet ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech 5432
```

#### 4. Kiểm tra Neon Dashboard

1. Vào Neon Dashboard: https://console.neon.tech
2. Kiểm tra database connection string
3. Đảm bảo database đang active
4. Kiểm tra IP allowlist (nếu có)

#### 5. Thử connection string khác

Neon có 2 loại connection:
- **Pooler** (recommended): `-pooler` trong hostname
- **Direct**: Không có `-pooler`

Thử cả 2 loại:
```env
# Pooler (recommended)
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require

# Direct
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require
```

#### 6. Thêm retry logic và better error handling

Code đã có retry logic trong TypeORM, nhưng có thể thêm:
- Connection timeout
- Better error messages
- Fallback options

#### 7. Kiểm tra firewall/VPN

- Tắt VPN nếu đang dùng
- Kiểm tra firewall settings
- Đảm bảo port 5432 không bị block

#### 8. Temporary workaround

Nếu vẫn không kết nối được, có thể:
- Dùng local PostgreSQL tạm thời
- Hoặc dùng Neon connection string từ dashboard (copy exact)

### Debug Steps:

1. ✅ Kiểm tra `.env` file có DATABASE_URL đúng không
2. ✅ Test DNS resolution: `nslookup ep-silent-art-a1tugx13-pooler.ap-southeast-1.aws.neon.tech`
3. ✅ Test connection với psql
4. ✅ Kiểm tra Neon dashboard
5. ✅ Thử connection string khác (pooler vs direct)
6. ✅ Kiểm tra network/firewall
