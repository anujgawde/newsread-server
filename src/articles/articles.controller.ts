import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Articles } from './entities/articles.entity';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('/get-all-articles') getAllArticles(
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('query') query: string,
  ) {
    return this.articlesService.getAllArticles(limit, page, query);
  }

  @Get('/:id') getArticleById(@Param('id') id: string) {
    return this.articlesService.getArticleById(id);
  }

  @Post('/read-article') readArticle(@Body() data: { id: string }) {
    return this.articlesService.readArticle(data.id);
  }

  @Post('update-article-visits') updateArticleVisits(@Body() data: any) {
    this.articlesService.updateArticleVisits(data);
  }

  // @Get('/get-latest-articles') getLatestArticles(
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ) {
  //   return this.articlesService.getLatestArticles(limit, page);
  // }

  // @Get('/get-trending-articles') getTrendingArticles(
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ) {
  //   return this.articlesService.getTrendingArticles(limit, page);
  // }

  // @Post('search')
  // async searchArticles(@Query('query') query: string): Promise<Articles[]> {
  //   if (!query) {
  //     return [];
  //   }
  //   return this.articlesService.searchArticles(query);
  // }
}
