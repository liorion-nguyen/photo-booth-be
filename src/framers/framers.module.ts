import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Framer } from './entities/framer.entity';
import { FramerContribution } from './entities/framer-contribution.entity';
import { FramersService } from './framers.service';
import { FramerContributionsService } from './framer-contributions.service';
import { AdminFramersController } from './admin-framers.controller';
import { FramersController } from './framers.controller';
import { FramerContributionsController } from './framer-contributions.controller';
import { AdminFramerContributionsController } from './admin-framer-contributions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Framer, FramerContribution]),
    CloudinaryModule,
  ],
  controllers: [
    FramersController,
    AdminFramersController,
    FramerContributionsController,
    AdminFramerContributionsController,
  ],
  providers: [FramersService, FramerContributionsService],
  exports: [FramersService],
})
export class FramersModule {}
