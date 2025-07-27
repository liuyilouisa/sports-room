import { MidwayConfig } from '@midwayjs/core';
import { User } from '../entity/user.entity';

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
        entities: [User],
      },
    },
  },
} as MidwayConfig;
