import { IsEmail, Length } from 'class-validator';

export class RegisterDTO {
  @IsEmail() email: string;
  @Length(3, 20) name: string;
  @Length(6, 50) password: string;
}

export class LoginDTO {
  @IsEmail() email: string;
  @Length(6, 50) password: string;
}
