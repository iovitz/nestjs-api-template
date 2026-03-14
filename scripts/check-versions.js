#!/usr/bin/env node

/**
 * 检查package.json中的版本固定性
 * 确保所有依赖都使用精确版本号，而不是范围版本
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const packageJsonPath = path.join(process.cwd(), "package.json");

function checkVersions() {
	console.log("🔍 Checking package.json version constraints...");

	try {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		const errors = [];

		// 检查dependencies
		if (packageJson.dependencies) {
			for (const [pkg, version] of Object.entries(packageJson.dependencies)) {
				if (version.startsWith("^") || version.startsWith("~")) {
					errors.push(
						`❌ dependencies.${pkg}: "${version}" uses version range (^ or ~)`,
					);
				} else if (version === "*" || version === "latest") {
					errors.push(
						`❌ dependencies.${pkg}: "${version}" uses unstable version (* or latest)`,
					);
				}
			}
		}

		// 检查devDependencies
		if (packageJson.devDependencies) {
			for (const [pkg, version] of Object.entries(
				packageJson.devDependencies,
			)) {
				if (version.startsWith("^") || version.startsWith("~")) {
					errors.push(
						`❌ devDependencies.${pkg}: "${version}" uses version range (^ or ~)`,
					);
				} else if (version === "*" || version === "latest") {
					errors.push(
						`❌ devDependencies.${pkg}: "${version}" uses unstable version (* or latest)`,
					);
				}
			}
		}

		// 检查peerDependencies
		if (packageJson.peerDependencies) {
			for (const [pkg, version] of Object.entries(
				packageJson.peerDependencies,
			)) {
				if (version.startsWith("^") || version.startsWith("~")) {
					errors.push(
						`❌ peerDependencies.${pkg}: "${version}" uses version range (^ or ~)`,
					);
				} else if (version === "*" || version === "latest") {
					errors.push(
						`❌ peerDependencies.${pkg}: "${version}" uses unstable version (* or latest)`,
					);
				}
			}
		}

		if (errors.length > 0) {
			console.error(`\n${errors.join("\n")}`);
			console.error(
				'\n💡 All package versions must use exact versions (e.g., "1.2.3")',
			);
			console.error("   Avoid using ^1.2.3, ~1.2.3, *, or latest");
			return false;
		}

		console.log("✅ All package versions are properly fixed!");
		return true;
	} catch (error) {
		console.error(`❌ Error reading package.json: ${error.message}`);
		return false;
	}
}

// 如果直接运行此脚本
if (require.main === module) {
	const success = checkVersions();
	process.exit(success ? 0 : 1);
}

module.exports = { checkVersions };
