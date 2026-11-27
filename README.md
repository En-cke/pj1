# SVG 编辑器 · 插件实践与插件式重构

CLI 使用 TypeScript 和 Node.js 22。先安装依赖并编译。

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/src/cli.js
node dist/src/cli.js --config plugins.config.json
node dist/src/cli.js --baseline
pnpm check
```

在 CLI 输入 `help` 查看命令，输入 `exit` 或 `quit` 退出。VS Code 扩展的启动过程见 [扩展说明](vscode-extension/README.md)。架构、ADR、测试证据和历史差异检查见 [Phase 2 项目文档](doc/README.md)。
