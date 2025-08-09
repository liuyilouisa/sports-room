import { ApiProperty } from '@midwayjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/* ====== 请求 DTO ====== */
export class CreateOrderDTO {
  @ApiProperty({ example: 1, description: '活动 ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  activityId: number;
}

/* ====== 响应 VO ====== */
export class OrderVO {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'a1b2c3d4' })
  secret: string;

  @ApiProperty({ example: 100 })
  costPoints: number;
}
