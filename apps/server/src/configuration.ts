import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as typeorm from '@midwayjs/typeorm';
import * as swagger from '@midwayjs/swagger';
import * as jwt from '@midwayjs/jwt';
import * as crossDomain from '@midwayjs/cross-domain';
import { JwtMiddleware } from './middleware/jwt.middleware';
import 'reflect-metadata';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { User } from './entity';
import * as bcrypt from 'bcryptjs';
import * as UniTestConfig from './config/config.unittest';
import * as DefaultConfig from './config/config.default';
import * as E2EConfig from './config/config.e2e';
import * as staticFile from '@midwayjs/static-file';

@Configuration({
  imports: [
    koa,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    typeorm,
    swagger,
    jwt,
    crossDomain,
    staticFile,
  ],
  importConfigs: [
    { default: DefaultConfig, unittest: UniTestConfig, e2e: E2EConfig },
  ],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    if (process.env.NODE_ENV === 'e2e') {
      const ds = this.app
        .getApplicationContext()
        .get(TypeORMDataSourceManager)
        .getDataSource('default');
      const repo = ds.getRepository(User);
      await repo.save({
        email: 'admin@test.com',
        name: 'Admin',
        password: await bcrypt.hash('123456', 10),
        role: 'admin',
      });
    }
    // 1. 中间件
    this.app.useMiddleware([JwtMiddleware]);

    // 2. 全局错误 -> JSON
    this.app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err: any) {
        ctx.status = err.status || 500;
        ctx.body = {
          code: err.code || 'INTERNAL_ERROR',
          message: err.message || '服务器内部错误',
        };
      }
    });
  }
}
