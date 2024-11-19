import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Articles } from './entities/articles.entity';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class ArticlesService {
  constructor(
    @Inject('ARTICLES_REPOSITORY')
    private articlesRepository: Repository<Articles>,
    private awsService: AwsService,
  ) {}

  // TODO: Add a cron job which will query newsdata.io for new articles and save them to the database.
  async saveArticles() {}

  async getLatestArticles(page: number = 1, limit: number = 10) {
    // Ensure limit does not exceed a maximum value
    limit = Math.min(limit, 100);

    const [data, total] = await this.articlesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async readArticle(id: string) {
    const selectedArticle = await this.articlesRepository.findOneBy({ id: id });
    if (!selectedArticle.mediaReference) {
      const audioUrl = await this.awsService.convertTextToSpeach(
        id,
        selectedArticle.content,
      );

      await this.articlesRepository.update(id, {
        ['mediaReference']: audioUrl,
      });
      return audioUrl;
    } else {
      return selectedArticle.mediaReference;
    }
  }
}
