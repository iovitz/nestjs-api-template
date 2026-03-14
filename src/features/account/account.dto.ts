import { IsEmail, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { VerifyCodeDto } from "src/shared/dto/verify-code.dto";

export class RegisterDto extends VerifyCodeDto {
  @ApiProperty({ description: "用户名", minLength: 2, maxLength: 10, example: "张三" })
  @IsString()
  @Length(2, 10)
  name: string;

  @ApiProperty({ description: "邮箱", minLength: 4, maxLength: 32, example: "test@example.com" })
  @IsEmail()
  @Length(4, 32)
  email: string;

  @ApiProperty({ description: "密码", minLength: 6, maxLength: 20, example: "123456" })
  @IsString()
  @Length(6, 20)
  password: string;
}

export class LoginDto extends VerifyCodeDto {
  @ApiProperty({ description: "邮箱", minLength: 4, maxLength: 32, example: "test@example.com" })
  @IsEmail()
  @Length(4, 32)
  email: string;

  @ApiProperty({ description: "密码", minLength: 6, maxLength: 20, example: "123456" })
  @IsString()
  @Length(6, 20)
  password: string;
}
