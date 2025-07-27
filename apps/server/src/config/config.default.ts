import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';
import { User } from '../entity/user.entity';

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
        entities: [User],
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
  },
} as MidwayConfig;
