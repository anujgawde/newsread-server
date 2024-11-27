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

  // In progress:
  // This function calls the newsdata.io api for fetching new articles throughout the day and saving them to the database.
  // TODO: Add a cron job which will query newsdata.io for new articles and save them to the database.
  async saveArticles() {}

  // Steps:
  // 1. Check for the limit being sent, should not exceed 100
  // 2. Send parameters for pagination and fetch articles
  // Return data
  async getLatestArticles(page: number = 1, limit: number = 10) {
    // Ensure limit does not exceed a maximum value
    limit = Math.min(limit, 100);

    const [data, total] = await this.articlesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      articles: data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // Steps:
  // 1. Find the article in our database - neondb
  // 2. Check if it has a mediaReference which is a pre-signed url for our audio file (This will be the news reading)
  // 3. If media reference is null:
  // - Send article ID and Content to aws service for converting the text into speech.
  // - Update the database with - mediaReference, bucketKey (needed to generate a new mediaReference after it expires in 1 hour), updatedAt timestamp (Needed further to keep a check if the link is expired)
  // - Wait time for 3 seconds when the audio file is uploaded for the first time. The pre-signed url takes time the when the file is uploaded to the bucket for the first time.
  // 4. If media reference is not null:
  // - Check if the updatedAt time in our database record is older than 55 minutes (a 5 minute buffer is maintained).
  // * If it is: Get a new pre-signed url from aws service and update the database with mediaReference (New audio URL) and updatedAt timestamp
  // * If it is not: Return the Media Reference
  async readArticle(id: string) {
    const selectedArticle = await this.articlesRepository.findOneBy({ id: id });

    if (!selectedArticle.mediaReference) {
      const { audioUrl, bucketKey } = await this.awsService.convertTextToSpeach(
        id,
        selectedArticle.content,
      );

      await this.articlesRepository.update(id, {
        ['mediaReference']: audioUrl,
        ['bucketKey']: bucketKey,
        ['updatedAt']: new Date(),
      });

      // TODO: Find alternative to wait for the pre-signed url to be fully active
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return audioUrl;
    } else {
      const updatedAt = new Date(selectedArticle.updatedAt).getTime();
      const now = Date.now();
      const differenceInMinutes = (now - updatedAt) / (1000 * 60);

      if (differenceInMinutes >= 55) {
        const audioUrl = await this.awsService.getAudioUrl(
          selectedArticle.bucketKey,
        );
        await this.articlesRepository.update(id, {
          ['mediaReference']: audioUrl,
          ['updatedAt']: new Date(),
        });
        return audioUrl;
      }
      return selectedArticle.mediaReference;
    }
  }

  async getArticleById(id: string) {
    return await this.articlesRepository.findOneBy({ id: id });
  }
}
