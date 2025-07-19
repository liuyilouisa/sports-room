import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1752904420566_1913',
  koa: {
    port: 7001,
  },
  jwt: {
    secret: 'your_jwt_secret',
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: join(__dirname, '../../sports.db'),
        synchronize: true,
        logging: true,
        entities: ['src/entity/**/*.ts'],
      },
    },
  },
  swagger: {
    title: 'Sports Room API',
    description: '体育活动室接口文档',
    version: '1.0.0',
    path: '/swagger-ui/',
  },
} as MidwayConfig;
