import { MidwayConfig } from '@midwayjs/core';
import { User, Activity, Comment } from '../entity';

export default {
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: true,
        entities: [User, Activity, Comment],
      },
    },
  },
} as MidwayConfig;
