import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PhotosService } from './photos.service';

@Controller('api/admin/photos')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  async getAllPhotos(@Query('userId') userId?: string) {
    const photos = userId
      ? await this.photosService.findByUserId(userId)
      : await this.photosService.findAllWithUsers();
    
    return {
      total: photos.length,
      photos: photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        createdAt: photo.createdAt,
        user: photo.user
          ? {
              id: photo.user.id,
              email: photo.user.email,
              name: photo.user.name,
              avatarUrl: photo.user.avatarUrl,
            }
          : null,
        metadata: {
          width: photo.width,
          height: photo.height,
          bytes: photo.bytes,
          format: photo.format,
        },
      })),
    };
  }

  @Delete(':id')
  async deletePhoto(@Param('id') id: string) {
    await this.photosService.remove(id);
    return { success: true };
  }
}
