#!/usr/bin/env node

const inquirer = require("inquirer");

const types = [
  { value: "feat", name: "✨ feat: 新功能" },
  { value: "fix", name: "🐛 fix: 修复bug" },
  { value: "docs", name: "📚 docs: 文档更新" },
  { value: "style", name: "💎 style: 代码格式调整" },
  { value: "refactor", name: "♻️ refactor: 代码重构" },
  { value: "perf", name: "🚀 perf: 性能优化" },
  { value: "test", name: "🧪 test: 测试相关" },
  { value: "build", name: "📦 build: 构建系统变更" },
  { value: "ci", name: "👷 ci: CI配置变更" },
  { value: "chore", name: "🔧 chore: 其他变更" },
  { value: "revert", name: "⏪ revert: 回滚提交" },
];

const scopes = ["account", "health", "db", "api", "ui", "config", "ci", "deps"];

const questions = [
  {
    type: "list",
    name: "type",
    message: "选择提交类型:",
    choices: types,
  },
  {
    type: "list",
    name: "scope",
    message: "选择影响范围 (可选):",
    choices: [...scopes, "custom", "none"],
    filter: (input) => {
      if (input === "none") return "";
      if (input === "custom") return "custom";
      return input;
    },
  },
  {
    type: "input",
    name: "customScope",
    message: "输入自定义范围:",
    when: (answers) => answers.scope === "custom",
    filter: (input) => input.trim(),
  },
  {
    type: "input",
    name: "subject",
    message: "输入简短描述:",
    validate: (input) => {
      if (!input.trim()) return "描述不能为空";
      if (input.length > 100) return "描述不能超过100个字符";
      return true;
    },
  },
  {
    type: "input",
    name: "body",
    message: "输入详细描述 (可选，按回车跳过):",
    filter: (input) => input.trim() || "",
  },
  {
    type: "confirm",
    name: "isBreaking",
    message: "这是破坏性变更吗?",
    default: false,
  },
  {
    type: "input",
    name: "breaking",
    message: "描述破坏性变更:",
    when: (answers) => answers.isBreaking,
    validate: (input) => {
      if (!input.trim()) return "破坏性变更需要描述";
      return true;
    },
  },
  {
    type: "input",
    name: "footer",
    message: "输入脚注 (如关联的issue，可选):",
    filter: (input) => input.trim() || "",
  },
];

function formatCommit(answers) {
  const scope = answers.customScope || answers.scope || "";
  const scopeStr = scope ? `(${scope})` : "";
  const breakingStr = answers.isBreaking ? `!\n\nBREAKING CHANGE: ${answers.breaking}` : "";
  const bodyStr = answers.body ? `\n\n${answers.body}` : "";
  const footerStr = answers.footer ? `\n\n${answers.footer}` : "";

  return `${answers.type}${scopeStr}: ${answers.subject}${breakingStr}${bodyStr}${footerStr}`;
}

module.exports = {
  prompter(cz, commit) {
    inquirer.prompt(questions).then((answers) => {
      const commitMessage = formatCommit(answers);
      console.error("\n生成的提交信息:");
      console.error("------------------------");
      console.error(commitMessage);
      console.error("------------------------\n");
      commit(commitMessage);
    });
  },
};
