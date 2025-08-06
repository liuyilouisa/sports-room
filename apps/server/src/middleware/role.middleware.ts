import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { BizError } from '../error/http.error';

@Middleware()
export class RoleMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 依赖 JwtMiddleware 已注入 ctx.state.user
      if (!ctx.state.user) {
        throw new BizError('UNAUTHORIZED', 401, '用户未登录');
      }

      if (ctx.state.user.role !== 'admin') {
        throw new BizError('FORBIDDEN', 403, '需要管理员权限');
      }

      await next();
    };
  }
}
