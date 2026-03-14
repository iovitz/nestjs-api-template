import { OptionalProps } from "@mikro-orm/core";
import { PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { ApiProperty } from "@nestjs/swagger";

export abstract class EntityBase {
	[OptionalProps]?: "createdAt" | "updatedAt";

	@PrimaryKey({
		type: "string",
		comment: "主键（雪花ID）",
	})
	@ApiProperty({
		description: "主键（雪花ID）",
		example: "1234567890123456789",
	})
	id: string;

	@Property({
		type: "timestamp",
		comment: "创建时间",
		defaultRaw: "CURRENT_TIMESTAMP",
	})
	@ApiProperty({ description: "创建时间", example: "2024-01-01T00:00:00.000Z" })
	createdAt: Date;

	@Property({
		type: "timestamp",
		comment: "更新时间",
		defaultRaw: "CURRENT_TIMESTAMP",
	})
	@ApiProperty({ description: "更新时间", example: "2024-01-01T00:00:00.000Z" })
	updatedAt: Date;
}
