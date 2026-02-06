import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosController } from './photos.controller';
import { AdminPhotosController } from './admin.controller';
import { ShareController } from './share.controller';
import { PhotosService } from './photos.service';
import { PhotoShareService } from './photo-share.service';
import { Photo } from './entities/photo.entity';
import { PhotoShare } from './entities/photo-share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo, PhotoShare])],
  controllers: [PhotosController, AdminPhotosController, ShareController],
  providers: [PhotosService, PhotoShareService],
  exports: [PhotosService, PhotoShareService],
})
export class PhotosModule {}
