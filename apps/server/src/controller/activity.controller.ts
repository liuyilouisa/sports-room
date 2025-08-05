import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { ActivityService } from '../service/activity.service';

@Controller('/api/activities')
export class ActivityController {
  @Inject()
  activityService: ActivityService;

  @Get()
  async list(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('keyword') keyword?: string
  ) {
    return this.activityService.paginate({ page, size, keyword });
  }
}
