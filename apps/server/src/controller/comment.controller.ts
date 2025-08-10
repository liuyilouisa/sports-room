import {
  Controller,
  Post,
  Get,
  Del,
  Body,
  Param,
  Query,
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
import { CommentService } from '../service/comment.service';
import { ActivityService } from '../service/activity.service';
import { UserService } from '../service/user.service';
import { CreateCommentDTO, CommentListDTO } from '../dto/comment.dto';
import { BizError } from '../error/http.error';
import { Context } from '@midwayjs/koa';

@ApiTags('用户端 - 评论')
@ApiBearerAuth()
@Controller('/api/activities/:activityId/comments', {
  middleware: [JwtMiddleware],
})
export class CommentController {
  @Inject()
  commentService: CommentService;
  @Inject()
  ctx: Context;
  @Inject()
  activityService: ActivityService;
  @Inject()
  userService: UserService;

  /* 发表评论 / 楼中楼回复 */
  @Post()
  @HttpCode(201)
  @ApiParam({ name: 'activityId', type: 'number', example: 1 })
  @ApiResponse({ status: 201, description: '发表成功' })
  @ApiResponse({ status: 400, description: 'activityId 非法' })
  @ApiResponse({ status: 401, description: '用户未登录或无权限' })
  async create(
    @Param('activityId') activityIdStr: string,
    @Body() dto: CreateCommentDTO
  ) {
    const activityId = await this.assertActivityExists(activityIdStr);
    dto.activityId = activityId;

    const { uid: userId } = await this.ctx.state.user;
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BizError('UNAUTHORIZED', 401, '用户未登录或无权限');
    }
    return this.commentService.create(userId, dto);
  }

  /* 分页拉取评论 */
  @Get()
  @ApiParam({ name: 'activityId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: '评论列表' })
  @ApiResponse({ status: 400, description: 'activityId 非法' })
  async list(
    @Param('activityId') activityIdStr: string,
    @Query() query: CommentListDTO
  ) {
    const activityId = await this.assertActivityExists(activityIdStr);
    return this.commentService.paginateByActivity(activityId, query);
  }

  /* 删除自己的评论（管理员可删任何）*/
  @Del('/:id')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '无权删除他人评论' })
  @ApiResponse({ status: 404, description: '评论不存在' })
  async remove(
    @Param('activityId') activityIdStr: string,
    @Param('id') id: number
  ) {
    await this.assertActivityExists(activityIdStr);
    const { uid: userId, role } = await this.ctx.state.user;
    const result = await this.commentService.remove(id, userId, role);
    if (result === null) {
      throw new BizError('COMMENT_NOT_FOUND', 404, '评论不存在');
    }
    if (result === false) {
      throw new BizError('FORBIDDEN', 403, '无权删除他人评论');
    }
    return { success: true };
  }

  private async assertActivityExists(activityIdStr: string): Promise<number> {
    const activityId = Number(activityIdStr);
    if (!activityId) {
      throw new BizError('INVALID_PARAM', 400, 'activityId 非法');
    }
    const activity = await this.activityService.findPublishedById(activityId);
    if (!activity) {
      throw new BizError('ACTIVITY_NOT_FOUND', 404, '活动不存在或未发布');
    }
    return activityId; // 返回合法的数字 id，供后续使用
  }
}
