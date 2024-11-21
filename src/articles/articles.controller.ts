import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('/') getLatestArticles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.articlesService.getLatestArticles(page, limit);
  }

  @Post('/read-article') readArticle(@Body() data: { id: string }) {
    return this.articlesService.readArticle(data.id);
  }
}
