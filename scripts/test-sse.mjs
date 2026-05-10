import http from "node:http";

const URL = "http://localhost:9876/api/samples/sse?count=2";
const t = Date.now();
let n = 0,
	buf = "";

console.log(`SSE: ${URL}\n`);

http
	.get(URL, (r) => {
		console.log(`状态: ${r.statusCode} 类型: ${r.headers["content-type"]}`);
		r.on("data", (c) => {
			buf += c;
			const lines = buf.split("\n");
			for (const l of lines.slice(0, -1)) {
				if (l.startsWith("data:")) console.log(`[${++n}] ${l}`);
			}
			buf = lines.pop() || "";
		});
		r.on("end", () => console.log(`\n${n} 条，${Date.now() - t}ms`));
	})
	.on("error", (e) => {
		console.error(e);
		process.exit(1);
	});
