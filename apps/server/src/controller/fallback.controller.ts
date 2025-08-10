import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('/')
export class FallbackController {
  @Inject()
  ctx: Context;

  // 通配路由，必须放在最后
  @Get('/*')
  async fallback() {
    const html = readFileSync(
      join(__dirname, '../../public/index.html'),
      'utf-8'
    );
    this.ctx.type = 'html';
    this.ctx.body = html;
  }
}
