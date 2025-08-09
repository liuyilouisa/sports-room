import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Inject,
  HttpCode,
} from '@midwayjs/core';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@midwayjs/swagger';
import { JwtMiddleware } from '../middleware/jwt.middleware';
import { OrderService } from '../service/order.service';
import { CreateOrderDTO } from '../dto/order.dto';
import { BizError } from '../error/http.error';
import { Context } from '@midwayjs/koa';

@ApiTags('用户端 - 订单')
@ApiBearerAuth()
@Controller('/api/orders', { middleware: [JwtMiddleware] })
export class OrderController {
  @Inject()
  orderService: OrderService;

  @Inject()
  ctx: Context;

  /** 报名（创建订单） POST /api/orders */
  @Post()
  @HttpCode(201)
  @ApiResponse({ status: 201, description: '报名成功' })
  @ApiResponse({ status: 409, description: '业务校验失败（名额/积分/时间）' })
  async create(@Body() dto: CreateOrderDTO) {
    const { uid } = this.ctx.state.user;
    if (!uid) throw new BizError('UNAUTHORIZED', 401, '用户未登录');
    return this.orderService.create(uid, dto);
  }

  /** 退款 POST /api/orders/:id/refund */
  @Post('/:id/refund')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: '退款成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 409, description: '不满足退款条件' })

  async refund(@Param('id') id: number) {
    const { uid } = this.ctx.state.user;
    if (!uid) throw new BizError('UNAUTHORIZED', 401, '用户未登录');
    return this.orderService.refund(id, uid);
  }

  /** 我的订单 GET /api/orders/my */
  @Get('/my')
  @ApiResponse({ status: 200, description: '订单列表' })
  async myOrders() {
    console.log("this.ctx.state.user", await this.ctx.state.user);
    const { uid } = this.ctx.state.user;
    if (!uid) throw new BizError('UNAUTHORIZED', 401, '用户未登录');
    return this.orderService.myOrders(uid);
  }
}
