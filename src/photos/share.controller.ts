import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PhotoShareService } from './photo-share.service';

@Controller('share')
export class ShareController {
  constructor(private readonly photoShareService: PhotoShareService) {}

  @Get(':token')
  async getPhotoByToken(@Param('token') token: string) {
    try {
      const photo = await this.photoShareService.getPhotoByToken(token);
      
      // Return formatted response with user info
      return {
        id: photo.id,
        url: photo.url,
        createdAt: photo.createdAt.toISOString(),
        user: photo.user
          ? {
              id: photo.user.id,
              name: photo.user.name,
              email: photo.user.email,
              avatarUrl: photo.user.avatarUrl,
            }
          : null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Share link is invalid or expired');
    }
  }
}
