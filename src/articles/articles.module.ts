import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { databaseProviders } from 'src/database/database.provider';
import { articlesRepository } from './articles.provider';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    ...databaseProviders,
    ...articlesRepository,
    AwsService,
  ],
})
export class ArticlesModule {}
