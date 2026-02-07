import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosModule } from './photos/photos.module';
import { FramersModule } from './framers/framers.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectTimeoutMS: 10000, // 10 seconds
            extra: {
              max: 10, // Maximum number of connections
              connectionTimeoutMillis: 10000,
            },
          }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_DATABASE || 'photobooth',
            connectTimeoutMS: 10000,
            extra: {
              max: 10,
              connectionTimeoutMillis: 10000,
            },
          }),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      retryAttempts: 3,
      retryDelay: 3000,
      logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }),
    CloudinaryModule,
    EmailModule,
    UsersModule,
    AuthModule,
    PhotosModule,
    FramersModule,
  ],
})
export class AppModule {}
