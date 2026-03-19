import { IsEnum, IsInt, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum SecurityType {
	Login = "login",
	Register = "register",
}

export class CreateSecurityDto {
	@ApiProperty({
		description: "验证码宽度",
		minimum: 80,
		maximum: 300,
		default: 120,
	})
	@IsInt()
	@Min(80)
	@Max(300)
	width: number = 120;

	@ApiProperty({
		description: "验证码高度",
		minimum: 30,
		maximum: 150,
		default: 40,
	})
	@IsInt()
	@Min(30)
	@Max(150)
	height: number = 40;

	@ApiProperty({
		description: "验证码类型",
		enum: SecurityType,
	})
	@IsEnum(SecurityType)
	type: SecurityType;

	@ApiProperty({
		description: "验证码字符长度",
		minimum: 4,
		maximum: 6,
		default: 4,
	})
	@IsInt()
	@Min(4)
	@Max(6)
	length: number = 4;
}

export class SecurityCodeDto {
	@ApiProperty({ description: "验证码ID" })
	id: string;

	@ApiProperty({ description: "验证码SVG图片" })
	svg: string;
}

export class ValidateSecurityDto {
	@ApiProperty({ description: "验证码ID" })
	id: string;

	@ApiProperty({ description: "用户输入的验证码" })
	code: string;

	@ApiProperty({
		description: "验证码类型",
		enum: SecurityType,
	})
	@IsEnum(SecurityType)
	type: SecurityType;
}
