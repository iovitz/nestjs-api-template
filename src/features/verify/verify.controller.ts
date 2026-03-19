import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
	CreateVerifyDto,
	ValidateVerifyDto,
	VerifyCodeDto,
} from "./verify.dto";
import { VerifyService } from "./verify.service";

@ApiTags("验证码")
@Controller("api/verify")
export class VerifyController {
	constructor(private readonly verifyService: VerifyService) {}

	@Get("create")
	@ApiOperation({ summary: "创建验证码" })
	@ApiResponse({
		status: 200,
		description: "返回验证码ID和SVG图片",
		type: VerifyCodeDto,
	})
	async createVerify(
		@Query() createVerifyDto: CreateVerifyDto,
	): Promise<VerifyCodeDto> {
		return this.verifyService.createVerify(createVerifyDto);
	}

	@Post("validate")
	@ApiOperation({ summary: "验证验证码" })
	@ApiResponse({
		status: 200,
		description: "返回验证结果",
	})
	async validateVerify(
		@Body() validateVerifyDto: ValidateVerifyDto,
	): Promise<{ valid: boolean }> {
		const { id, code, type } = validateVerifyDto;
		const valid = await this.verifyService.validateVerify(id, code, type);
		return { valid };
	}
}
