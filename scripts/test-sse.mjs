/**
 * SSE (Server-Sent Events) 测试脚本
 * 测试 http://localhost:9876/api/samples/sse?count=2 接口
 */

const SSE_URL = "http://localhost:9876/api/samples/sse";
const COUNT = 2;

async function testSseEndpoint() {
	console.log(`正在测试 SSE 接口: ${SSE_URL}?count=${COUNT}`);
	console.log("=".repeat(50));

	try {
		const response = await fetch(`${SSE_URL}?count=${COUNT}`, {
			headers: {
				Accept: "text/event-stream",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
		}

		console.log(`响应状态: ${response.status}`);
		console.log(`内容类型: ${response.headers.get("content-type")}`);
		console.log("");

		// SSE 数据解析
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";
		let eventCount = 0;
		let currentEvent = "";

		console.log("开始接收 SSE 事件:");
		console.log("-".repeat(50));

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				// 处理缓冲区中剩余的数据
				if (buffer.trim()) {
					for (const line of buffer.split("\n")) {
						if (
							line.startsWith("event:") ||
							line.startsWith("data:") ||
							line.startsWith("id:")
						) {
							console.log(line);
						}
					}
					eventCount++;
					console.log(`--- 事件 ${eventCount} 结束 ---`);
				}
				console.log("\n流已关闭");
				break;
			}

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() || "";

			for (const line of lines) {
				if (
					line.startsWith("event:") ||
					line.startsWith("data:") ||
					line.startsWith("id:")
				) {
					console.log(line);
					currentEvent += `${line}\n`;
				} else if (line === "" && currentEvent.includes("data:")) {
					// 空行表示一个事件结束
					eventCount++;
					console.log(`--- 事件 ${eventCount} 结束 ---`);
					console.log("");
					currentEvent = "";
				}
			}
		}

		console.log("-".repeat(50));
		console.log(`共接收 ${eventCount} 个事件`);
		console.log("测试完成");
	} catch (error) {
		console.error("测试失败:", error.message);
		process.exit(1);
	}
}

testSseEndpoint();
