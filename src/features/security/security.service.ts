import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/global/redis/redis.module";
import {
	CreateSecurityDto,
	SecurityCodeDto,
	SecurityType,
} from "./security.dto";

@Injectable()
export class SecurityService {
	private readonly expireSeconds = 900; // 15分钟过期

	constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

	async createSecurity(
		createSecurityDto: CreateSecurityDto,
	): Promise<SecurityCodeDto> {
		const { width, height, type, length } = createSecurityDto;

		// 生成随机验证码
		const code = this.generateCode(length);
		const id = this.generateId();

		// 生成SVG图片
		const svg = this.generateSvg(code, width, height);

		// 存储到Redis
		const key = `security:${type}:${id}`;
		await this.redisClient.setex(key, this.expireSeconds, code);

		return { id, svg };
	}

	async validateSecurity(
		id: string,
		code: string,
		type: SecurityType,
	): Promise<boolean> {
		const key = `security:${type}:${id}`;
		const storedCode = await this.redisClient.get(key);

		if (!storedCode) {
			return false;
		}

		// 验证成功后删除验证码
		await this.redisClient.del(key);

		// 不区分大小写比较
		return storedCode.toLowerCase() === code.toLowerCase();
	}

	private generateCode(length: number): string {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
		let code = "";
		for (let i = 0; i < length; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return code;
	}

	private generateId(): string {
		return `${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
	}

	private generateSvg(code: string, width: number, height: number): string {
		const fontSize = Math.min(height * 0.6, 30);
		const chars = code.split("");

		// 生成干扰线
		const lines = this.generateNoiseLines(width, height, 3);

		// 生成噪点
		const dots = this.generateNoiseDots(width, height, 20);

		// 为每个字符生成不同的颜色和偏移
		const textElements = chars.map((char, index) => {
			const x = (width / (chars.length + 1)) * (index + 1);
			const y = height / 2 + fontSize / 3;
			const rotate = (Math.random() - 0.5) * 30;
			const hue = Math.floor(Math.random() * 60) + 200; // 蓝色调

			return `<text x="${x}" y="${y}" font-size="${fontSize}" 
        fill="hsl(${hue}, 70%, 40%)" text-anchor="middle"
        font-family="Arial, sans-serif" font-weight="bold"
        transform="rotate(${rotate}, ${x}, ${y})">${this.escapeXml(char)}</text>`;
		});

		return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
        <filter id="blur">
            <feGaussianBlur stdDeviation="0.5"/>
        </filter>
    </defs>
    <rect width="100%" height="100%" fill="#f8f9fa"/>
    ${lines}
    ${dots}
    ${textElements.join("\n")}
</svg>`;
	}

	private generateNoiseLines(
		width: number,
		height: number,
		count: number,
	): string {
		let lines = "";
		for (let i = 0; i < count; i++) {
			const x1 = Math.random() * width;
			const y1 = Math.random() * height;
			const x2 = Math.random() * width;
			const y2 = Math.random() * height;
			const hue = Math.floor(Math.random() * 60) + 200;
			const opacity = Math.random() * 0.3 + 0.1;
			lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="hsl(${hue}, 60%, 50%)" stroke-width="${Math.random() * 1.5 + 0.5}" opacity="${opacity}"/>`;
		}
		return lines;
	}

	private generateNoiseDots(
		width: number,
		height: number,
		count: number,
	): string {
		let dots = "";
		for (let i = 0; i < count; i++) {
			const x = Math.random() * width;
			const y = Math.random() * height;
			const r = Math.random() * 1.5 + 0.5;
			const hue = Math.floor(Math.random() * 60) + 200;
			dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="hsl(${hue}, 60%, 50%)" opacity="${Math.random() * 0.5 + 0.2}"/>`;
		}
		return dots;
	}

	private escapeXml(char: string): string {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&apos;",
		};
		return map[char] ?? char;
	}
}
