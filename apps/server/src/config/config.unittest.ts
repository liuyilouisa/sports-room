import { MidwayConfig } from '@midwayjs/core';
import { User } from '../entity/user.entity';
import { Activity } from '../entity/activity.entity';

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
        entities: [User, Activity],
      },
    },
  },
} as MidwayConfig;
