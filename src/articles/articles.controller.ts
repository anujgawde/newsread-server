import { Controller, Get, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get() getLatestArticles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.articlesService.getLatestArticles(page, limit);
  }

  @Get('/read-article') readArticle(@Query('articleId') articleId) {
    return this.articlesService.readArticle(articleId);
  }
}
