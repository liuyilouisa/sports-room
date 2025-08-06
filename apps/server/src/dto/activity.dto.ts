import {
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@midwayjs/swagger';
import { Type } from 'class-transformer';

export class CreateActivityDTO {
  @ApiProperty({ example: '篮球友谊赛' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: '本周六下午 3 点，欢迎参加！' })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: '2024-08-10T15:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional({ example: '2024-08-10T17:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endAt?: string | null;
}

export class UpdateActivityDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ enum: ['draft', 'published'], example: 'published' })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ example: '2024-08-10T15:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2024-08-10T17:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endAt?: string | null;
}

export class SearchActivityDTO {
  @ApiPropertyOptional({ example: '篮球' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 10;

  @ApiPropertyOptional({
    example: 'createdAt_DESC',
    description: '排序字段_方向，如 createdAt_DESC / title_ASC',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt_DESC';
}
