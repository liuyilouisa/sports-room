import { Middleware, Inject } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { Context, NextFunction } from '@midwayjs/koa';
import { BizError } from '../error/http.error';

@Middleware()
export class JwtMiddleware {
  @Inject() jwt: JwtService;

  // 需要鉴权的路由前缀
  private readonly authPrefix = ['/api/auth/me', '/api/admin'];

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const needAuth = this.authPrefix.some(p => ctx.path.startsWith(p));
      if (!needAuth) return await next(); // 直接放过

      const token = ctx.headers['authorization']?.replace('Bearer ', '');
      if (!token) {
        throw new BizError('TOKEN_MISSING', 401, 'Token 缺失');
      }

      try {
        ctx.state.user = await this.jwt.verify(token);
      } catch {
        throw new BizError('INVALID_TOKEN', 401, 'Token 无效');
      }

      await next();
    };
  }
}
