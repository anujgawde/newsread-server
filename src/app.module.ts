import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AwsModule } from './aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [ConfigModule.forRoot(), AwsModule, ArticlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
