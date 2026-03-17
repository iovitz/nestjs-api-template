import { IsEmail, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { VerifyCodeDto } from "src/shared/dto/verify-code.dto";

/**
 * 账户信息返回类型（不包含敏感信息）
 */
export class AccountResponse {
	@ApiProperty({ description: "账户ID" })
	id: string;

	@ApiProperty({ description: "用户昵称" })
	name: string;

	@ApiProperty({ description: "邮箱" })
	email: string;
}

export class RegisterDto extends VerifyCodeDto {
	@ApiProperty({
		description: "用户名",
		minLength: 2,
		maxLength: 10,
		example: "张三",
	})
	@IsString()
	@Length(2, 10)
	name: string;

	@ApiProperty({
		description: "邮箱",
		minLength: 4,
		maxLength: 32,
		example: "test@example.com",
	})
	@IsEmail()
	@Length(4, 32)
	email: string;

	@ApiProperty({
		description: "密码",
		minLength: 6,
		maxLength: 20,
		example: "123456",
	})
	@IsString()
	@Length(6, 20)
	password: string;
}

/**
 * 退出登录返回类型
 */
export class LogoutResponse {
	@ApiProperty({ description: "消息" })
	message: string;
}

export class LoginDto extends VerifyCodeDto {
	@ApiProperty({
		description: "邮箱",
		minLength: 4,
		maxLength: 32,
		example: "test@example.com",
	})
	@IsEmail()
	@Length(4, 32)
	email: string;

	@ApiProperty({
		description: "密码",
		minLength: 6,
		maxLength: 20,
		example: "123456",
	})
	@IsString()
	@Length(6, 20)
	password: string;
}
