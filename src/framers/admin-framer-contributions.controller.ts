import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { FramerContributionsService } from './framer-contributions.service';
import type { ContributionStatus } from './entities/framer-contribution.entity';

@Controller('api/admin/framer-contributions')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminFramerContributionsController {
  constructor(
    private readonly contributionsService: FramerContributionsService,
  ) {}

  @Get()
  async list(@Query('status') status?: ContributionStatus) {
    const list = await this.contributionsService.findAll(status);
    return {
      contributions: list.map((c) => ({
        id: c.id,
        userId: c.userId,
        name: c.name,
        imageUrl: c.imageUrl,
        layoutType: c.layoutType,
        status: c.status,
        createdAt: c.createdAt,
        reviewedAt: c.reviewedAt,
        reviewedBy: c.reviewedBy,
      })),
    };
  }

  @Patch(':id/accept')
  async accept(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    const framer = await this.contributionsService.accept(id, req.user.id);
    return {
      success: true,
      framer: {
        id: framer.id,
        name: framer.name,
        imageUrl: framer.imageUrl,
        layoutType: framer.layoutType,
        aspectRatio: framer.aspectRatio,
        createdAt: framer.createdAt,
      },
    };
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    await this.contributionsService.reject(id, req.user.id);
    return { success: true };
  }
}
