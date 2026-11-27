import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import ts from "typescript";

const [base = "final", target = "p2", output = "docs/metrics", targetLabel = target] = process.argv.slice(2);
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });

function category(file, phase1) {
  if (file.startsWith("vscode-extension/src/")) return "VS Code";
  if (file.startsWith("plugins/")) return "插件";
  if (file === "src/cli.ts" || file.startsWith("src/host/") || file === "src/editor/createEditor.ts") return "装配处";
  if (phase1 && /^src\/(command\/(?!Command\.ts|EditingCommand\.ts|SetCommand\.ts|TreeCommand\.ts)|model\/(?:Circle|Ellipse|Line|Rect|Text)Shape\.ts)/.test(file)) return "插件";
  return "内核";
}

function responsibility(file) {
  const name = file.split("/").at(-1).replace(/\.ts$/, "");
  if (name !== "Command" && name !== "EditingCommand" && name.endsWith("Command")) return "命令 " + name.slice(0, -7);
  if (name.endsWith("Shape")) return "领域图形 " + name;
  if (file.endsWith("/index.ts")) return "注册 " + file.split("/").at(-2) + " 扩展";
  return ({
    api: "内核公开 API", cli: "CLI 参数和终端会话", Editor: "命令执行和历史",
    CommandDispatcher: "注册表分发", createEditor: "依赖创建和装配选择",
    codePlugins: "代码方式装配", pluginLoader: "配置、清单和激活事务", Registry: "注册与暂存",
    contracts: "扩展点及公开契约", EditingCommand: "编辑快照和回滚", Command: "命令契约",
    SvgDocument: "根图形、编辑、序列化和树渲染", ShapeFactory: "图形提供器选择",
    SvgParser: "XML 读回与 ID 分配", FileService: "SVG 文件读写", Tokenizer: "命令分词",
    Format: "SVG 转义和数值格式", EditorError: "领域错误", providers: "内置图形提供器",
    directory: "目录接口及 Node 文件系统适配器", extension: "注册 Explorer 装饰和 Outline",
    outline: "XML 符号层级和位置", box: "复合图形、读回和属性处理",
  }[name] ?? name);
}

const decisions = new Set([
  ts.SyntaxKind.IfStatement, ts.SyntaxKind.ForStatement, ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.ForInStatement, ts.SyntaxKind.WhileStatement, ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.CaseClause, ts.SyntaxKind.CatchClause, ts.SyntaxKind.ConditionalExpression,
]);
const shortCircuit = new Set([ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken]);

function complexity(file, text) {
  let functions = 0;
  let branches = 0;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isFunctionLike(node) && node.body) functions++;
    if (decisions.has(node.kind) || (ts.isBinaryExpression(node) && shortCircuit.has(node.operatorToken.kind))) branches++;
    ts.forEachChild(node, visit);
  }
  visit(source);
  return functions + branches;
}

function inventory(ref) {
  const phase1 = ref === "final";
  return git("ls-tree", "-r", "--name-only", ref, "--", "src", "plugins", "vscode-extension/src")
    .trim().split(/\r?\n/).filter(file => file.endsWith(".ts"))
    .map(file => {
      const source = git("show", ref + ":" + file);
      return { file, role: responsibility(file), category: category(file, phase1),
        loc: source.replace(/\r?\n$/, "").split(/\r?\n/).length, cc: complexity(file, source) };
    });
}

const inventories = [inventory(base), inventory(target)];
const groups = ["内核", "装配处", "插件", "CLI 合计", "VS Code"];
const table = [
  "# SVG 编辑器源码指标",
  "",
  "从 Git 树读取 " + base + " 和 " + targetLabel + " 的 TypeScript 运行源码。LOC 含空行与注释。每个有函数体的函数记 1，分支、循环、case、catch、条件表达式和短路表达式各加 1，包括顶层决策。排除测试、构建产物和依赖。Phase 1 尚未插件化，原图形与命令按重构后的职责归类。",
  "",
  "| 分类 | " + base + " LOC | " + targetLabel + " LOC | LOC Δ | " + base + " 圈复杂度 | " + targetLabel + " 圈复杂度 | 圈复杂度 Δ |",
  "|---|---:|---:|---:|---:|---:|---:|",
];
for (const category of groups) {
  const [a, b] = inventories.map(entries => entries
    .filter(entry => category === "CLI 合计" ? entry.category !== "VS Code" : entry.category === category)
    .reduce(({ loc, cc }, entry) => ({ loc: loc + entry.loc, cc: cc + entry.cc }), {loc: 0, cc: 0}));
  table.push("| " + [category, a.loc, b.loc, b.loc - a.loc, a.cc, b.cc, b.cc - a.cc].join(" | ") + " |");
}
for (const [ref, inventory] of [[base, inventories[0]], [targetLabel, inventories[1]]]) {
  table.push("", "## " + ref + " 文件清单", "", "| 文件 | 分类 | 职责 | LOC | 圈复杂度 |", "|---|---|---|---:|---:|");
  for (const {file, category, role, loc, cc} of inventory) {
    table.push("| " + [file, category, role, loc, cc].join(" | ") + " |");
  }
}
mkdirSync(output, { recursive: true });
writeFileSync(output + "/README.md", table.join("\n") + "\n");
