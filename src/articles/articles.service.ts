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
  // https://newsdata.io/api/1/news?apikey=-abcd-&q=trending&country=us&language=en
  // Latest: https://newsdata.io/api/1/latest?apikey=-abcd-
  async saveArticles() {}

  // Steps:
  // 1. Check for the limit being sent, should not exceed 100
  // 2. Send parameters for pagination and fetch articles
  // Return data
  // async getLatestArticles(page: number = 1, limit: number = 10) {
  //   // Ensure limit does not exceed a maximum value
  //   limit = Math.min(limit, 100);

  //   const [data, total] = await this.articlesRepository.findAndCount({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //   });

  //   return {
  //     articles: data,
  //     total,
  //     page,
  //     lastPage: Math.ceil(total / limit),
  //   };
  // }

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

  async updateArticleVisits(data: any) {
    // Prepare the array of update promises
    const updatePromises = Object.entries(data).map(
      ([id, visits]: [string, number]) => {
        return this.articlesRepository
          .createQueryBuilder()
          .update(Articles)
          .set({ visitCount: visits })
          .where('id = :id', { id })
          .execute();
      },
    );
    // Execute all updates in parallel
    await Promise.all(updatePromises);
  }

  async getTrendingArticles(limit: number = 10, page: number = 1) {
    const [articles, total] = await this.articlesRepository.findAndCount({
      take: limit, // Number of posts per page
      skip: (page - 1) * limit, // Offset based on the page number
      order: { visitCount: 'DESC' }, // Optional: Sort by visits, or any other criteria
    });

    return {
      articles,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLatestArticles(limit: number = 10, page: number = 1) {
    // Currently, the condition for returning articles which have been posted in the last 12 hours is commented out since we're not fetching new articles in every few hours as of now.
    // When new article fetching is enabled, the where condition will be added
    const [recentArticles, total] = await this.articlesRepository
      .createQueryBuilder('articles')
      // .where("articles.date_published >= NOW() - INTERVAL '12 hours'")
      .orderBy('articles.date_published', 'DESC')
      .skip((page - 1) * limit) // Pagination offset
      .take(limit) // Limit to 10 items
      .getManyAndCount(); // Fetches data and total count

    return {
      articles: recentArticles, // Should return an array of articles
      total, // Total count of records
      limit,
      offset: 0,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchArticles(limit: number = 10, page: number = 1, query: string) {
    const [searchArticles, total] = await this.articlesRepository
      .createQueryBuilder('articles')
      .where('articles.search_vector @@ plainto_tsquery(:query)', { query })
      .orderBy(
        'ts_rank(articles.search_vector, plainto_tsquery(:query))',
        'DESC',
      )
      .skip((page - 1) * limit) // Pagination offset
      .take(limit) // Limit to 10 items
      .getManyAndCount(); // Fetches data and total count

    return {
      articles: searchArticles,
      total,
      limit,
      offset: 0,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllArticles(limit: number = 10, page: number = 1, query: string) {
    if (query.length && query !== 'null') {
      if (query === 'trending') {
        return this.getTrendingArticles();
      } else if (query === 'latest') {
        return this.getLatestArticles();
      } else {
        return this.searchArticles(10, 1, query);
      }
    } else {
      const [articles, total] = await this.articlesRepository.findAndCount({
        take: limit, // Number of posts per page
        skip: (page - 1) * limit, // Offset based on the page number
        order: { datePublished: 'DESC' }, // Optional: Sort by visits, or any other criteria
      });

      return {
        articles,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    }
  }
}
