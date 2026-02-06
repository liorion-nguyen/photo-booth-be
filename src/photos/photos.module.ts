import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosController } from './photos.controller';
import { AdminPhotosController } from './admin.controller';
import { PhotosService } from './photos.service';
import { Photo } from './entities/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  controllers: [PhotosController, AdminPhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
