import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoShare } from './entities/photo-share.entity';
import { Photo } from './entities/photo.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class PhotoShareService {
  constructor(
    @InjectRepository(PhotoShare)
    private shareRepo: Repository<PhotoShare>,
    @InjectRepository(Photo)
    private photoRepo: Repository<Photo>,
  ) {}

  /**
   * Generate a unique token for sharing
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create a share link for a photo (expires in 2 weeks)
   */
  async createShareLink(photoId: string): Promise<PhotoShare> {
    const photo = await this.photoRepo.findOne({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Check if there's an existing valid share link
    const existing = await this.shareRepo.findOne({
      where: { photoId },
      order: { createdAt: 'DESC' },
    });

    if (existing && existing.expiresAt > new Date()) {
      return existing;
    }

    // Create new share link (expires in 2 weeks)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 2 weeks

    const share = this.shareRepo.create({
      photoId,
      token: this.generateToken(),
      expiresAt,
    });

    return this.shareRepo.save(share);
  }

  /**
   * Get photo by share token (public access)
   */
  async getPhotoByToken(token: string): Promise<Photo> {
    const share = await this.shareRepo.findOne({
      where: { token },
    });

    if (!share) {
      throw new NotFoundException('Share link not found');
    }

    if (share.expiresAt < new Date()) {
      throw new NotFoundException('Share link has expired');
    }

    // Load photo with user relation
    const photo = await this.photoRepo.findOne({
      where: { id: share.photoId },
      relations: ['user'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  /**
   * Get share link info by photo ID
   */
  async getShareByPhotoId(photoId: string): Promise<PhotoShare | null> {
    return this.shareRepo.findOne({
      where: { photoId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete expired shares (cleanup job)
   */
  async deleteExpiredShares(): Promise<number> {
    const result = await this.shareRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }
}
