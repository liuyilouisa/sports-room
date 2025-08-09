import { MidwayConfig } from '@midwayjs/core';
import { User, Activity, Comment, Order } from '../entity';

export default {
  koa: {
    port: null,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities: [User, Activity, Comment, Order],
      },
    },
  },
} as MidwayConfig;
