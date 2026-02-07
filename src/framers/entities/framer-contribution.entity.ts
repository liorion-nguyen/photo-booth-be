import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type ContributionStatus = 'pending' | 'approved' | 'rejected';

@Entity('framer_contributions')
export class FramerContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'cloudinary_id', type: 'varchar', nullable: true })
  cloudinaryId: string | null;

  @Column({ name: 'layout_type', length: 10 })
  layoutType: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: ContributionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'reviewed_by', type: 'varchar', nullable: true })
  reviewedBy: string | null;
}
