import { DataSource } from 'typeorm';

import { Articles } from './entities/articles.entity';

export const articlesRepository = [
  {
    provide: 'ARTICLES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Articles),
    inject: ['DATA_SOURCE'],
  },
];
