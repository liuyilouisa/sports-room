import { Controller, Get, Inject, Param, Query } from '@midwayjs/core';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@midwayjs/swagger';
import { BizError } from '../error/http.error';
import { ActivityService } from '../service/activity.service';
import { SearchActivityDTO } from '../dto/activity.dto';

@ApiTags('用户端 - 活动')
@ApiBearerAuth()
@Controller('/api/activities')
export class UserActivityController {
  @Inject()
  activityService: ActivityService;

  /**
   * 列表 + 关键字搜索
   */
  @Get()
  @ApiResponse({ status: 200, description: '获取活动列表成功' })
  async list(@Query() query: SearchActivityDTO) {
    try {
      return await this.activityService.search(query);
    } catch (err) {
      console.error('>>> 活动列表异常:', err);
      throw new BizError('INTERNAL_ERROR', 500, '服务器内部错误');
    }
  }

  /**
   * 详情
   */
  @Get('/:id')
  @ApiResponse({ status: 200, description: '获取活动详情成功' })
  @ApiResponse({ status: 404, description: '活动不存在或未发布' })
  async detail(@Param('id') id: number) {
    const activity = await this.activityService.findPublishedById(id);
    if (!activity) {
      throw new BizError('ACTIVITY_NOT_FOUND', 404, '活动不存在或未发布');
    }
    return activity;
  }
}
