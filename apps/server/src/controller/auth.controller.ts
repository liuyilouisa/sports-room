import { Controller, Post, Body, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { JwtService } from '@midwayjs/jwt';
import { RegisterDTO, LoginDTO } from '../dto/auth.dto';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@midwayjs/swagger';

@ApiTags('认证')

@Controller('/api/auth')
export class AuthController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  jwt: JwtService;

  @Post('/register')
  @ApiBody({ type: RegisterDTO })
  @ApiResponse({ type: Object })
  async register(@Body() dto: RegisterDTO) {
    const user = await this.userService.create(dto);
    return { id: user.id, name: user.name, email: user.email };
  }

  @Post('/login')
  @ApiBody({ type: LoginDTO })
  async login(@Body() dto: LoginDTO) {
    const user = await this.userService.validateAndGet(dto.email, dto.password);
    const token = await this.jwt.sign({ uid: user.id });
    console.log("token:", token);
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  @Get('/me')
  @ApiBearerAuth()
  async me() {
    return this.ctx.state.user || {};
  }
}