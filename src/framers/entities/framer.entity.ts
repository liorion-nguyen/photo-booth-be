import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('framers')
export class Framer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'cloudinary_id', type: 'varchar', nullable: true })
  cloudinaryId: string | null;

  @Column({ name: 'layout_type', length: 10 })
  layoutType: string;

  @Column({ name: 'aspect_ratio', type: 'float', nullable: true })
  aspectRatio: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
