import http from "node:http";

const STREAM_URL = "http://localhost:9876/api/samples/stream";
const COUNT = 5;

const startTime = Date.now();
let lineCount = 0;
let buffer = "";

console.log(`测试: ${STREAM_URL}?count=${COUNT}\n`);

const req = http.request(new URL(`${STREAM_URL}?count=${COUNT}`), (res) => {
	console.log(`状态: ${res.statusCode}`);
	console.log(`类型: ${res.headers["content-type"]}`);

	res.on("data", (chunk) => {
		buffer += chunk.toString();
		const lines = buffer.split("\n");
		buffer = lines.pop() || "";

		for (const line of lines) {
			if (line.trim()) {
				lineCount++;
				console.log(`[${lineCount}] [${Date.now() - startTime}ms] ${line}`);
			}
		}
	});

	res.on("end", () => {
		console.log(`\n共 ${lineCount} 条，耗时 ${Date.now() - startTime}ms`);
	});
});

req.on("error", (e) => {
	console.error(e);
	process.exit(1);
});

req.end();
