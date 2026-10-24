# SVG Editor CLI

PJ1 Phase 1：使用 TypeScript 和面向对象方法编写的命令行 SVG 编辑器。

## 运行

环境要求：Node.js 20 或更高版本，推荐使用 pnpm。

```bash
pnpm install
pnpm run cli
```

进入 `svg>` 提示符后，可以执行：

```text
init 800 600
create rect background 0 0 800 600 #ffffff
create circle point 100 100 20 red
move point 30 0
tree
save demo.svg
```

输入 `help` 查看全部命令，输入 `exit` 或 `quit` 退出。

## 验证

```bash
pnpm run check
```

该命令依次执行 TypeScript 类型检查、构建和全部自动化测试。完整架构、设计模式、协作过程及一致性自查见 [`doc/README.md`](doc/README.md)。
