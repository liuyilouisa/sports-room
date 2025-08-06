import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class RoleMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // ctx.state.user 由 JwtMiddleware 注入
      if (!ctx.state.user) {
        ctx.status = 401;
        ctx.body = { message: 'Unauthorized: no user info' };
        return;
      }

      if (ctx.state.user.role !== 'admin') {
        ctx.status = 403;
        ctx.body = { message: 'Forbidden: admin only' };
        return;
      }
      await next();
    };
  }
}
