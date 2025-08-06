import {
  Controller,
  Post,
  Put,
  Del,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
} from '@midwayjs/core';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Activity } from '../../entity/activity.entity';
import { RoleMiddleware } from '../../middleware/role.middleware';
import { CreateActivityDTO, UpdateActivityDTO } from '../../dto/activity.dto';
import { BizError } from '../../error/http.error';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@midwayjs/swagger';

@ApiTags('管理端 - 活动')
@ApiBearerAuth()
@Controller('/api/admin/activities', { middleware: [RoleMiddleware] })
export class AdminActivityController {
  @InjectEntityModel(Activity)
  activityRepo: Repository<Activity>;

  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateActivityDTO })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() dto: CreateActivityDTO) {
    const act = this.activityRepo.create(dto);
    await this.activityRepo.save(act);
    return act;
  }

  @Put('/:id')
  @ApiBody({ type: UpdateActivityDTO })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '活动不存在' })
  async update(@Param('id') id: number, @Body() dto: UpdateActivityDTO) {
    const act = await this.activityRepo.findOneBy({ id });
    if (!act) throw new BizError('ACTIVITY_NOT_FOUND', 404, '活动不存在');
    Object.assign(act, dto);
    await this.activityRepo.save(act);
    return act;
  }

  @Del('/:id')
  @HttpCode(204)
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '活动不存在' })
  async remove(@Param('id') id: number) {
    const { affected } = await this.activityRepo.delete(id);
    if (!affected) throw new BizError('ACTIVITY_NOT_FOUND', 404, '活动不存在');
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'size', required: false, type: 'number', example: 20 })
  async list(@Query('page') pageStr?: string, @Query('size') sizeStr?: string) {
    const page = Math.max(1, Number(pageStr) || 1);
    const size = Math.max(1, Number(sizeStr) || 20);

    const [data, total] = await this.activityRepo.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { startAt: 'DESC' },
    });
    return { data, total };
  }
}
