import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { FramersService } from './framers.service';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Controller('api/admin/framers')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminFramersController {
  constructor(private readonly framersService: FramersService) {}

  @Post('from-url')
  async createFromUrl(
    @Body('name') name: string,
    @Body('imageUrl') imageUrl: string,
    @Body('layoutType') layoutType: string,
  ) {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      throw new BadRequestException('imageUrl is required');
    }
    const validLayouts = ['1x4', '2x3', '2x2'];
    if (!layoutType || !validLayouts.includes(layoutType)) {
      throw new BadRequestException(
        'layoutType must be one of: 1x4, 2x3, 2x2',
      );
    }
    const framer = await this.framersService.createFromUrl(
      (name && name.trim()) || 'Framer',
      imageUrl.trim(),
      layoutType,
    );
    return {
      id: framer.id,
      name: framer.name,
      imageUrl: framer.imageUrl,
      layoutType: framer.layoutType,
      aspectRatio: framer.aspectRatio,
      createdAt: framer.createdAt,
    };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(
            new Error(`Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('layoutType') layoutType: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Use field name "photo".',
      );
    }
    const validLayouts = ['1x4', '2x3', '2x2'];
    if (!layoutType || !validLayouts.includes(layoutType)) {
      throw new BadRequestException(
        'layoutType must be one of: 1x4, 2x3, 2x2',
      );
    }
    const framer = await this.framersService.create(
      file.buffer,
      (name && name.trim()) || file.originalname?.replace(/\.[^.]+$/, '') || 'Framer',
      layoutType,
      file.originalname,
    );
    return {
      id: framer.id,
      name: framer.name,
      imageUrl: framer.imageUrl,
      layoutType: framer.layoutType,
      aspectRatio: framer.aspectRatio,
      createdAt: framer.createdAt,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string | undefined,
    @Body('layoutType') layoutType: string | undefined,
    @Body('imageUrl') imageUrl: string | undefined,
  ) {
    const framer = await this.framersService.update(id, {
      name,
      layoutType,
      imageUrl,
    });
    return {
      id: framer.id,
      name: framer.name,
      imageUrl: framer.imageUrl,
      layoutType: framer.layoutType,
      aspectRatio: framer.aspectRatio,
      createdAt: framer.createdAt,
    };
  }

  @Get()
  async list() {
    const framers = await this.framersService.findAll();
    return {
      framers: framers.map((f) => ({
        id: f.id,
        name: f.name,
        imageUrl: f.imageUrl,
        layoutType: f.layoutType,
        aspectRatio: f.aspectRatio,
        createdAt: f.createdAt,
      })),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.framersService.remove(id);
    return { success: true };
  }
}
