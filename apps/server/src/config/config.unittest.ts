import { MidwayConfig } from '@midwayjs/core';
import { User } from '../entity/user.entity';
import { Activity } from '../entity/activity.entity';
import { Comment } from '../entity/comment.entity';

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
        entities: [User, Activity, Comment],
      },
    },
  },
} as MidwayConfig;
