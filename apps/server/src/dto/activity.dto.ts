import {
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@midwayjs/swagger';

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
}
