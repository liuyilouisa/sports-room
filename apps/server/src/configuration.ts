import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as typeorm from '@midwayjs/typeorm';
import * as swagger from '@midwayjs/swagger';
import * as jwt from '@midwayjs/jwt';
import * as crossDomain from '@midwayjs/cross-domain';
import { JwtMiddleware } from './middleware/jwt.middleware';
import 'reflect-metadata';

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
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // 1. 中间件：JwtMiddleware 已经在 resolve() 里做路径白名单，这里全局注册即可
    this.app.useMiddleware([JwtMiddleware]);

    // 2. 全局错误 -> JSON（不再依赖 DefaultErrorFilter）
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
