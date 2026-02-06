import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { memoryStorage } from 'multer';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Controller('api/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(
            new Error(
              `Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { id: string } },
  ): Promise<{ url: string; id: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded. Use field name "photo".');
    }

    const photo = await this.photosService.upload(file.buffer, req.user.id, file.originalname);
    return { url: photo.url, id: photo.id };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: { user: { id: string; role?: string } }) {
    // User chỉ xem ảnh của mình, admin xem tất cả
    if (req.user.role === 'admin') {
      return this.photosService.findAllWithUsers();
    }
    return this.photosService.findAll(req.user.id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const photo = await this.photosService.findOne(id);
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.photosService.remove(id);
    return { success: true };
  }
}
