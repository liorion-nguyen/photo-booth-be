import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Framer } from './entities/framer.entity';
import {
  FramerContribution,
  ContributionStatus,
} from './entities/framer-contribution.entity';
import { FramersService } from './framers.service';

const VALID_LAYOUTS = ['1x4', '2x3', '2x2'];

@Injectable()
export class FramerContributionsService {
  constructor(
    @InjectRepository(FramerContribution)
    private contributionRepo: Repository<FramerContribution>,
    private cloudinary: CloudinaryService,
    private framersService: FramersService,
  ) {}

  async create(
    userId: string,
    payload: {
      name: string;
      layoutType: string;
      imageUrl?: string;
      buffer?: Buffer;
      originalName?: string;
    },
  ): Promise<FramerContribution> {
    if (!VALID_LAYOUTS.includes(payload.layoutType)) {
      throw new BadRequestException(
        `layoutType must be one of: ${VALID_LAYOUTS.join(', ')}`,
      );
    }
    const name = (payload.name && payload.name.trim()) || 'Khung đóng góp';

    let imageUrl: string;
    let cloudinaryId: string | null = null;

    if (payload.buffer) {
      const result = await this.cloudinary.uploadBuffer(
        payload.buffer,
        'photobooth/contributions',
        payload.originalName ? undefined : undefined,
      );
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    } else if (payload.imageUrl && payload.imageUrl.trim()) {
      imageUrl = payload.imageUrl.trim();
    } else {
      throw new BadRequestException(
        'Gửi file ảnh (photo) hoặc link ảnh (imageUrl)',
      );
    }

    const contribution = this.contributionRepo.create({
      userId,
      name,
      imageUrl,
      cloudinaryId,
      layoutType: payload.layoutType,
      status: 'pending',
    });
    return this.contributionRepo.save(contribution);
  }

  async findByUser(userId: string): Promise<FramerContribution[]> {
    return this.contributionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(status?: ContributionStatus): Promise<FramerContribution[]> {
    if (status) {
      return this.contributionRepo.find({
        where: { status },
        order: { createdAt: 'DESC' },
      });
    }
    return this.contributionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<FramerContribution | null> {
    return this.contributionRepo.findOne({ where: { id } });
  }

  async accept(id: string, adminUserId: string): Promise<Framer> {
    const c = await this.findOne(id);
    if (!c) throw new BadRequestException('Yêu cầu không tồn tại');
    if (c.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý');
    }
    const framer = await this.framersService.createFromUrl(
      c.name,
      c.imageUrl,
      c.layoutType,
    );
    c.status = 'approved';
    c.reviewedAt = new Date();
    c.reviewedBy = adminUserId;
    await this.contributionRepo.save(c);
    return framer;
  }

  async reject(id: string, adminUserId: string): Promise<void> {
    const c = await this.findOne(id);
    if (!c) throw new BadRequestException('Yêu cầu không tồn tại');
    if (c.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý');
    }
    c.status = 'rejected';
    c.reviewedAt = new Date();
    c.reviewedBy = adminUserId;
    await this.contributionRepo.save(c);
  }
}
