// api-test.js - API Integration Tests
const BASE_URL = "http://localhost:3000";
let sessionCookie = "";
const testEmail = `test_${Date.now()}@example.com`;

async function api({ path, method = "GET", query, body, cookies }) {
	let url = `${BASE_URL}${path}`;
	if (query) url += `?${new URLSearchParams(query)}`;

	const res = await fetch(url, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(cookies && { Cookie: cookies }),
		},
		body: body && method !== "GET" ? JSON.stringify(body) : undefined,
	});

	const data = await res.json();
	if (res.headers.has("set-cookie"))
		sessionCookie = res.headers.get("set-cookie").split(";")[0];
	return { status: res.status, data };
}

async function eq(expected, actual, msg) {
	if (expected !== actual)
		throw new Error(`${msg}: expected ${expected}, got ${actual}`);
}

// 注册
let r = await api({
	path: "/api/account/register",
	method: "POST",
	body: {
		name: "Test User",
		email: testEmail,
		password: "123456",
		verifyCode: "123456",
	},
});
eq(201, r.status, "Register");

// 登录
r = await api({
	path: "/api/account/login",
	method: "POST",
	body: { email: testEmail, password: "123456", verifyCode: "123456" },
});
eq(200, r.status, "Login");

// 获取 profile
r = await api({ path: "/api/account/profile", cookies: sessionCookie });
eq(200, r.status, "Get Profile");
eq(testEmail, r.data.email, "Profile email");

console.log("[PASS] All tests passed!");
