import { IsInt, IsOptional, IsString, Length, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@midwayjs/swagger';
import { Type } from 'class-transformer';

/* ====== 请求 DTO ====== */

/** 发表评论 / 回复评论 */
export class CreateCommentDTO {
  @ApiProperty({ example: '这个活动太棒了！' })
  @IsString()
  @Length(1, 500)
  content: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  activityId: number;

  /** 传值即为楼中楼回复；不传就是一级评论 */
  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentId?: number;
}

/** 分页拉取某活动的评论列表 */
export class CommentListDTO {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 20;
}

/* ====== 响应 VO ====== */

/** 单条评论回包 */
export class CommentVO {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '这个活动太棒了！' })
  content: string;

  @ApiProperty({ example: 1 })
  parentId: number | null;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '张三' })
  userName: string;

  @ApiProperty({ example: '2024-08-07T12:00:00.000Z' })
  createdAt: Date;

  /** 子评论（楼中楼） */
  @ApiProperty({ type: [CommentVO] })
  children?: CommentVO[];
}
