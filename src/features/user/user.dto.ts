import { IsEmail, IsOptional, IsString, Length } from "class-validator";
import { VerifyCodeDto } from "src/shared/dto/verify-code.dto";

export class RegisterDto extends VerifyCodeDto {
  @IsString()
  @Length(2, 10)
  name: string;

  @IsEmail()
  @Length(4, 32)
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;
}

export class LoginDto extends VerifyCodeDto {
  @IsEmail()
  @Length(4, 32)
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;
}

export class UpdateUserDto {
  @IsString()
  @Length(2, 10)
  @IsOptional()
  name?: string;

  @IsEmail()
  @Length(4, 32)
  @IsOptional()
  email?: string;
}
