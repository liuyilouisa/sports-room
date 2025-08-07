import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';
import { User } from '../entity/user.entity';
import { Activity } from '../entity/activity.entity';
import { Comment } from '../entity/comment.entity';

export default {
  keys: '1752904420566_1913',
  koa: { port: 7001 },
  jwt: { secret: 'your_jwt_secret', expiresIn: '7d' },
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: join(__dirname, '../../sports.db'),
        synchronize: true,
        logging: true,
        entities: [User, Activity, Comment],
      },
    },
  },
  swagger: {
    title: 'Sports Room API',
    path: '/swagger-ui/',
    auth: {
      name: 'bearer',
      authType: 'bearer',
      description: 'JWT Bearer Token',
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    },
  },
} as MidwayConfig;
