import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Framer } from './entities/framer.entity';

@Injectable()
export class FramersService {
  constructor(
    @InjectRepository(Framer)
    private framerRepo: Repository<Framer>,
    private cloudinary: CloudinaryService,
  ) {}

  async create(
    buffer: Buffer,
    name: string,
    layoutType: string,
    originalName?: string,
  ): Promise<Framer> {
    const result = await this.cloudinary.uploadBuffer(
      buffer,
      'photobooth/framers',
      originalName ? undefined : undefined,
    );
    const aspectRatio =
      result.width && result.height ? result.width / result.height : null;
    const framer = this.framerRepo.create({
      name,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      layoutType,
      aspectRatio,
    });
    return this.framerRepo.save(framer);
  }

  async findAll(): Promise<Framer[]> {
    return this.framerRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Framer | null> {
    return this.framerRepo.findOne({ where: { id } });
  }

  async update(
    id: string,
    payload: { name?: string; layoutType?: string; imageUrl?: string },
  ): Promise<Framer> {
    const framer = await this.findOne(id);
    if (!framer) {
      throw new BadRequestException('Framer not found');
    }
    const validLayouts = ['1x4', '2x3', '2x2'];
    if (payload.layoutType !== undefined) {
      if (!validLayouts.includes(payload.layoutType)) {
        throw new BadRequestException(
          `layoutType must be one of: ${validLayouts.join(', ')}`,
        );
      }
      framer.layoutType = payload.layoutType;
    }
    if (payload.name !== undefined && payload.name.trim() !== '') {
      framer.name = payload.name.trim();
    }
    if (payload.imageUrl !== undefined && payload.imageUrl.trim() !== '') {
      framer.imageUrl = payload.imageUrl.trim();
    }
    return this.framerRepo.save(framer);
  }

  async createFromUrl(
    name: string,
    imageUrl: string,
    layoutType: string,
  ): Promise<Framer> {
    const validLayouts = ['1x4', '2x3', '2x2'];
    if (!validLayouts.includes(layoutType)) {
      throw new BadRequestException(
        `layoutType must be one of: ${validLayouts.join(', ')}`,
      );
    }
    const framer = this.framerRepo.create({
      name: name?.trim() || 'Framer',
      imageUrl,
      cloudinaryId: null,
      layoutType,
      aspectRatio: null,
    });
    return this.framerRepo.save(framer);
  }

  async remove(id: string): Promise<void> {
    const framer = await this.findOne(id);
    if (framer) {
      if (framer.cloudinaryId) {
        await this.cloudinary.deleteByPublicId(framer.cloudinaryId);
      }
      await this.framerRepo.remove(framer);
    }
  }
}
