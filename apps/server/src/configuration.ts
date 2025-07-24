import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as typeorm from '@midwayjs/typeorm';
import * as swagger from '@midwayjs/swagger';
import * as jwt from '@midwayjs/jwt';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
// import { ReportMiddleware } from './middleware/report.middleware';
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
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([JwtMiddleware]);
    // this.app.useMiddleware([ReportMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
