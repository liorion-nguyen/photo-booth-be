import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FramerContributionsService } from './framer-contributions.service';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Controller('api/framer-contributions')
@UseGuards(JwtAuthGuard)
export class FramerContributionsController {
  constructor(
    private readonly contributionsService: FramerContributionsService,
  ) {}

  @Get('me')
  async myContributions(@Req() req: { user: { id: string } }) {
    const list = await this.contributionsService.findByUser(req.user.id);
    return {
      contributions: list.map((c) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.imageUrl,
        layoutType: c.layoutType,
        status: c.status,
        createdAt: c.createdAt,
        reviewedAt: c.reviewedAt,
      })),
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
  async submit(
    @Req() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('layoutType') layoutType: string,
    @Body('imageUrl') imageUrl: string | undefined,
  ) {
    if (!file && !(imageUrl && imageUrl.trim())) {
      throw new BadRequestException(
        'Gửi file ảnh (photo) hoặc link ảnh (imageUrl)',
      );
    }
    const contribution = await this.contributionsService.create(req.user.id, {
      name,
      layoutType,
      imageUrl: imageUrl?.trim(),
      buffer: file?.buffer,
      originalName: file?.originalname,
    });
    return {
      id: contribution.id,
      name: contribution.name,
      imageUrl: contribution.imageUrl,
      layoutType: contribution.layoutType,
      status: contribution.status,
      createdAt: contribution.createdAt,
    };
  }
}
