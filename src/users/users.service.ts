import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByProvider(provider: 'google' | 'facebook', providerId: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { provider, providerId },
    });
  }

  async createWithPassword(
    email: string,
    password: string,
    name?: string,
  ): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('Email đã được sử dụng');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
      emailVerified: false,
      provider: null,
      providerId: null,
      role: 'user',
    });
    return this.userRepo.save(user);
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    user.emailVerified = true;
    return this.userRepo.save(user);
  }

  async setEmailVerifiedByEmail(email: string): Promise<void> {
    await this.userRepo.update(
      { email: email.toLowerCase() },
      { emailVerified: true },
    );
  }

  async createOrUpdateFromOAuth(
    provider: 'google' | 'facebook',
    providerId: string,
    email: string,
    name?: string,
    avatarUrl?: string,
  ): Promise<User> {
    let user = await this.findByProvider(provider, providerId);
    if (user) {
      user.name = name ?? user.name;
      user.avatarUrl = avatarUrl ?? user.avatarUrl;
      user.emailVerified = true;
      return this.userRepo.save(user);
    }
    user = await this.findByEmail(email);
    if (user) {
      user.provider = provider;
      user.providerId = providerId;
      user.name = name ?? user.name;
      user.avatarUrl = avatarUrl ?? user.avatarUrl;
      user.emailVerified = true;
      return this.userRepo.save(user);
    }
    const newUser = this.userRepo.create({
      email: email.toLowerCase(),
      passwordHash: null,
      name: name || null,
      avatarUrl: avatarUrl || null,
      emailVerified: true,
      provider,
      providerId,
      role: 'user',
    });
    return this.userRepo.save(newUser);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) return false;
    return bcrypt.compare(password, user.passwordHash);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateRole(userId: string, role: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    user.role = role;
    return this.userRepo.save(user);
  }

  async remove(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      await this.userRepo.remove(user);
    }
  }
}
