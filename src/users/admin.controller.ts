import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersService } from './users.service';
import { PhotosService } from '../photos/photos.service';

@Controller('api/admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly photosService: PhotosService,
  ) {}

  @Get()
  async getAllUsers() {
    const users = await this.usersService.findAll();
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const photoCount = await this.photosService.countByUserId(user.id);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          role: user.role || 'user',
          provider: user.provider,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          photoCount,
        };
      }),
    );
    return {
      total: usersWithStats.length,
      users: usersWithStats,
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new Error('User not found');
    const photoCount = await this.photosService.countByUserId(user.id);
    return {
      ...user,
      photoCount,
    };
  }

  @Put(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    if (!['user', 'admin'].includes(role)) {
      throw new Error('Invalid role. Must be "user" or "admin"');
    }
    const user = await this.usersService.updateRole(id, role);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    // Xóa tất cả ảnh của user trước
    await this.photosService.removeByUserId(id);
    // Sau đó xóa user
    await this.usersService.remove(id);
    return { success: true };
  }
}
