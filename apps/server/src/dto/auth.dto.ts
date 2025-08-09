import { ApiProperty } from '@midwayjs/swagger';
import { IsEmail, Length } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alice' })
  @Length(3, 20)
  name: string;

  @ApiProperty({ example: '123456' })
  @Length(6, 50)
  password: string;
}

export class LoginDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @Length(6, 50)
  password: string;
}
