import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Articles {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'date_published' })
  datePublished: Date;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'source_icon' })
  sourceIcon: string;

  @Column({ name: 'source_url' })
  sourceUrl: string;

  @Column()
  sentiment: string;

  @Column({ name: 'media_reference' })
  mediaReference: string;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'bucket_key' })
  bucketKey: string;
}
