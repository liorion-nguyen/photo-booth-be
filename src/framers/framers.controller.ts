import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { FramersService } from './framers.service';

@Controller('api/framers')
export class FramersController {
  constructor(private readonly framersService: FramersService) {}

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

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const framer = await this.framersService.findOne(id);
    if (!framer) throw new NotFoundException('Framer not found');
    return {
      id: framer.id,
      name: framer.name,
      imageUrl: framer.imageUrl,
      layoutType: framer.layoutType,
      aspectRatio: framer.aspectRatio,
      createdAt: framer.createdAt,
    };
  }
}
