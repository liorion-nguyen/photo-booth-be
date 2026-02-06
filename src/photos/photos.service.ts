import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Photo } from './entities/photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photoRepo: Repository<Photo>,
    private cloudinary: CloudinaryService,
  ) {}

  async upload(buffer: Buffer, userId?: string, originalName?: string): Promise<Photo> {
    const result = await this.cloudinary.uploadBuffer(
      buffer,
      'photobooth',
      originalName ? undefined : undefined,
    );

    const photo = this.photoRepo.create({
      userId: userId || null,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });

    return this.photoRepo.save(photo);
  }

  async findAll(userId?: string): Promise<Photo[]> {
    const where = userId ? { userId } : {};
    return this.photoRepo.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithUsers(): Promise<Photo[]> {
    return this.photoRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Photo | null> {
    return this.photoRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    if (photo) {
      await this.cloudinary.deleteByPublicId(photo.cloudinaryId);
      await this.photoRepo.remove(photo);
    }
  }

  async findByUserId(userId: string): Promise<Photo[]> {
    return this.photoRepo.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.photoRepo.count({ where: { userId } });
  }

  async removeByUserId(userId: string): Promise<void> {
    const photos = await this.findByUserId(userId);
    for (const photo of photos) {
      await this.cloudinary.deleteByPublicId(photo.cloudinaryId);
    }
    await this.photoRepo.delete({ userId });
  }
}
