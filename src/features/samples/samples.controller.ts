import { Controller, Get, Header, Query, Sse } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { StreamableFile } from "@nestjs/common";
import { SamplesService } from "./samples.service";
import { SkipFormat } from "src/aspects/interceptors/formatter/formatter.interceptor";

@ApiTags("Samples")
@Controller("api/samples")
export class SamplesController {
	constructor(private readonly service: SamplesService) {}

	@Get("stream")
	@ApiOperation({ summary: "流式返回测试接口" })
	@SkipFormat()
	@Header("Content-Type", "application/x-ndjson")
	stream(@Query("count") count = "10"): StreamableFile {
		return this.service.getStreamFile(Math.min(Math.max(+count || 10, 1), 100));
	}

	@Get("sse")
	@ApiOperation({ summary: "SSE测试接口" })
	@SkipFormat()
	@Sse()
	sse(@Query("count") count = "10") {
		return this.service.createSseStream(
			Math.min(Math.max(+count || 10, 1), 100),
		);
	}
}
