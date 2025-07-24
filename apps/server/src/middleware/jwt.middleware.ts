import { Middleware, Inject } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class JwtMiddleware {
  @Inject() jwt: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const token = ctx.headers['authorization']?.replace('Bearer ', '');
      if (token) {
        try {
          ctx.state.user = this.jwt.verify(token);
        } catch {
          ctx.throw(401, 'Token 无效');
        }
      }
      await next();
    };
  }
}