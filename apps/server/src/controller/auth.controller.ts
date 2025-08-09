import { Controller, Post, Body, Get, Inject, HttpCode } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { JwtService } from '@midwayjs/jwt';
import { RegisterDTO, LoginDTO } from '../dto/auth.dto';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@midwayjs/swagger';
import { BizError } from '../error/http.error';

@ApiTags('认证')
@Controller('/api/auth')
export class AuthController {
  @Inject() ctx: Context;
  @Inject() userService: UserService;
  @Inject() jwt: JwtService;

  @Post('/register')
  @HttpCode(201)
  @ApiBody({ type: RegisterDTO })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 409, description: '邮箱已存在' })
  async register(@Body() dto: RegisterDTO) {
    const exist = await this.userService.findByEmail(dto.email);
    if (exist) {
      throw new BizError('USER_EXISTS', 409, '邮箱已存在');
    }
    const user = await this.userService.create(dto);
    this.ctx.set('Location', `/api/users/${user.id}`);
    return { id: user.id, name: user.name, email: user.email };
  }

  @Post('/login')
  @ApiBody({ type: LoginDTO })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  async login(@Body() dto: LoginDTO) {
    const user = await this.userService.validateAndGet(dto.email, dto.password);
    if (!user) {
      throw new BizError('INVALID_CREDENTIALS', 401, '邮箱或密码错误');
    }
    const token = await this.jwt.sign({ uid: user.id, role: user.role });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  @Get('/me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '当前用户信息' })
  async me() {
    const { uid } = this.ctx.state.user;
    console.log("this.ctx.state.user in auth", this.ctx.state.user);

    // 中间件已保证 uid 必存在
    const user = await this.userService.findById(uid);
    if (!user) {
      throw new BizError('USER_NOT_FOUND', 404, '用户不存在');
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
