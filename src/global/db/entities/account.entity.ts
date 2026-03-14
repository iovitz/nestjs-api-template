import { Entity, Property } from "@mikro-orm/decorators/legacy";
import { t } from "@mikro-orm/postgresql";
import { ApiProperty } from "@nestjs/swagger";
import { EntityBase } from "./entity-base";

@Entity({ tableName: "accounts" })
export class Account extends EntityBase {
	@Property({
		type: t.text,
		length: 10,
		nullable: false,
		comment: "用户昵称",
	})
	@ApiProperty({ description: "用户昵称", example: "张三" })
	name: string;

	@Property({
		type: t.text,
		length: 32,
		nullable: false,
		unique: true,
		comment: "邮件",
	})
	@ApiProperty({ description: "邮箱", example: "test@example.com" })
	email: string;

	@Property({
		type: t.text,
		length: 255,
		nullable: false,
		comment: "密码",
	})
	password: string;

	@Property({
		type: t.tinyint,
		comment: "状态：0（用户正常），1（未校验邮箱），2（账号被封禁）",
		default: 0,
	})
	@ApiProperty({
		description: "状态：0-正常，1-未校验邮箱，2-账号被封禁",
		example: 0,
		enum: [0, 1, 2],
	})
	status: number;

	@Property({
		type: t.datetime,
		nullable: true,
		comment: "最后登录时间",
	})
	@ApiProperty({
		description: "最后登录时间",
		example: "2024-01-01T00:00:00.000Z",
		required: false,
	})
	lastLoginAt?: Date;
}
