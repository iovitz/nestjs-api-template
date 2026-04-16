import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import {
	CreateSecurityDto,
	ValidateSecurityDto,
	SecurityCodeDto,
} from "./security.dto";
import { SecurityService } from "./security.service";

@ApiTags("安全")
@Controller("api/security")
@AllowAnonymous()
export class SecurityController {
	constructor(private readonly securityService: SecurityService) {}

	@Get("create")
	@ApiOperation({ summary: "创建验证码" })
	@ApiResponse({
		status: 200,
		description: "返回验证码ID和SVG图片",
		type: SecurityCodeDto,
	})
	async createSecurity(
		@Query() createSecurityDto: CreateSecurityDto,
	): Promise<SecurityCodeDto> {
		return this.securityService.createSecurity(createSecurityDto);
	}

	@Post("validate")
	@ApiOperation({ summary: "验证验证码" })
	@ApiResponse({
		status: 200,
		description: "返回验证结果",
	})
	async validateSecurity(
		@Body() validateSecurityDto: ValidateSecurityDto,
	): Promise<{ valid: boolean }> {
		const { id, code, type } = validateSecurityDto;
		const valid = await this.securityService.validateSecurity(id, code, type);
		return { valid };
	}
}
