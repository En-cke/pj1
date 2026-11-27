# SVG 编辑器源码指标

从 Git 树读取 final 和 p2 的 TypeScript 运行源码。LOC 含空行与注释。每个有函数体的函数记 1，分支、循环、case、catch、条件表达式和短路表达式各加 1，包括顶层决策。排除测试、构建产物和依赖。Phase 1 尚未插件化，原图形与命令按重构后的职责归类。

| 分类 | final LOC | p2 LOC | LOC Δ | final 圈复杂度 | p2 圈复杂度 | 圈复杂度 Δ |
|---|---:|---:|---:|---:|---:|---:|
| 内核 | 523 | 806 | 283 | 235 | 282 | 47 |
| 装配处 | 36 | 214 | 178 | 12 | 83 | 71 |
| 插件 | 218 | 612 | 394 | 151 | 277 | 126 |
| CLI 合计 | 777 | 1632 | 855 | 398 | 642 | 244 |
| VS Code | 0 | 98 | 98 | 0 | 27 | 27 |

## final 文件清单

| 文件 | 分类 | 职责 | LOC | 圈复杂度 |
|---|---|---|---:|---:|
| src/cli.ts | 装配处 | CLI 参数和终端会话 | 28 | 11 |
| src/command/AddToCommand.ts | 插件 | 命令 AddTo | 9 | 4 |
| src/command/CanvasCommand.ts | 插件 | 命令 Canvas | 10 | 9 |
| src/command/Command.ts | 内核 | 命令契约 | 14 | 0 |
| src/command/CreateCommand.ts | 插件 | 命令 Create | 17 | 7 |
| src/command/DeleteCommand.ts | 插件 | 命令 Delete | 9 | 4 |
| src/command/EditingCommand.ts | 内核 | 编辑快照和回滚 | 39 | 5 |
| src/command/GroupCommand.ts | 插件 | 命令 Group | 9 | 4 |
| src/command/HelpCommand.ts | 插件 | 命令 Help | 14 | 1 |
| src/command/InitCommand.ts | 插件 | 命令 Init | 11 | 10 |
| src/command/MoveCommand.ts | 插件 | 命令 Move | 11 | 6 |
| src/command/ReadCommand.ts | 插件 | 命令 Read | 10 | 3 |
| src/command/RedoCommand.ts | 插件 | 命令 Redo | 3 | 1 |
| src/command/ReorderCommand.ts | 插件 | 命令 Reorder | 9 | 6 |
| src/command/SaveCommand.ts | 插件 | 命令 Save | 10 | 4 |
| src/command/ScaleCommand.ts | 插件 | 命令 Scale | 10 | 6 |
| src/command/SetCommand.ts | 内核 | 命令 Set | 9 | 4 |
| src/command/ShowCommand.ts | 插件 | 命令 Show | 5 | 3 |
| src/command/TreeCommand.ts | 内核 | 命令 Tree | 5 | 3 |
| src/command/UndoCommand.ts | 插件 | 命令 Undo | 3 | 1 |
| src/command/UngroupCommand.ts | 插件 | 命令 Ungroup | 9 | 4 |
| src/editor/CommandDispatcher.ts | 内核 | 注册表分发 | 37 | 22 |
| src/editor/Editor.ts | 内核 | 命令执行和历史 | 40 | 16 |
| src/editor/createEditor.ts | 装配处 | 依赖创建和装配选择 | 8 | 1 |
| src/io/FileService.ts | 内核 | SVG 文件读写 | 20 | 9 |
| src/io/SvgParser.ts | 内核 | XML 读回与 ID 分配 | 73 | 42 |
| src/model/CircleShape.ts | 插件 | 领域图形 CircleShape | 13 | 15 |
| src/model/ContainerShape.ts | 内核 | 领域图形 ContainerShape | 80 | 26 |
| src/model/EditorError.ts | 内核 | 领域错误 | 6 | 1 |
| src/model/EllipseShape.ts | 插件 | 领域图形 EllipseShape | 13 | 16 |
| src/model/Format.ts | 内核 | SVG 转义和数值格式 | 17 | 4 |
| src/model/LineShape.ts | 插件 | 领域图形 LineShape | 13 | 16 |
| src/model/RectShape.ts | 插件 | 领域图形 RectShape | 17 | 16 |
| src/model/Shape.ts | 内核 | 领域图形 Shape | 58 | 15 |
| src/model/ShapeFactory.ts | 内核 | 图形提供器选择 | 31 | 13 |
| src/model/SvgDocument.ts | 内核 | 根图形、编辑、序列化和树渲染 | 78 | 65 |
| src/model/TextShape.ts | 插件 | 领域图形 TextShape | 13 | 15 |
| src/parser/Tokenizer.ts | 内核 | 命令分词 | 16 | 10 |

## p2 文件清单

| 文件 | 分类 | 职责 | LOC | 圈复杂度 |
|---|---|---|---:|---:|
| plugins/box/box.ts | 插件 | 复合图形、读回和属性处理 | 92 | 29 |
| plugins/box/index.ts | 插件 | 注册 box 扩展 | 30 | 9 |
| plugins/builtin/commands/AddToCommand.ts | 插件 | 命令 AddTo | 9 | 4 |
| plugins/builtin/commands/CanvasCommand.ts | 插件 | 命令 Canvas | 10 | 9 |
| plugins/builtin/commands/CreateCommand.ts | 插件 | 命令 Create | 18 | 7 |
| plugins/builtin/commands/DeleteCommand.ts | 插件 | 命令 Delete | 9 | 4 |
| plugins/builtin/commands/GroupCommand.ts | 插件 | 命令 Group | 9 | 4 |
| plugins/builtin/commands/HelpCommand.ts | 插件 | 命令 Help | 17 | 3 |
| plugins/builtin/commands/InitCommand.ts | 插件 | 命令 Init | 11 | 10 |
| plugins/builtin/commands/MoveCommand.ts | 插件 | 命令 Move | 13 | 6 |
| plugins/builtin/commands/ReadCommand.ts | 插件 | 命令 Read | 10 | 3 |
| plugins/builtin/commands/RedoCommand.ts | 插件 | 命令 Redo | 3 | 1 |
| plugins/builtin/commands/ReorderCommand.ts | 插件 | 命令 Reorder | 9 | 6 |
| plugins/builtin/commands/SaveCommand.ts | 插件 | 命令 Save | 10 | 4 |
| plugins/builtin/commands/ScaleCommand.ts | 插件 | 命令 Scale | 10 | 6 |
| plugins/builtin/commands/ShowCommand.ts | 插件 | 命令 Show | 5 | 3 |
| plugins/builtin/commands/UndoCommand.ts | 插件 | 命令 Undo | 3 | 1 |
| plugins/builtin/commands/UngroupCommand.ts | 插件 | 命令 Ungroup | 9 | 4 |
| plugins/builtin/index.ts | 插件 | 注册 builtin 扩展 | 65 | 24 |
| plugins/builtin/providers.ts | 插件 | 内置图形提供器 | 72 | 22 |
| plugins/builtin/shapes/CircleShape.ts | 插件 | 领域图形 CircleShape | 13 | 15 |
| plugins/builtin/shapes/EllipseShape.ts | 插件 | 领域图形 EllipseShape | 13 | 16 |
| plugins/builtin/shapes/LineShape.ts | 插件 | 领域图形 LineShape | 13 | 16 |
| plugins/builtin/shapes/RectShape.ts | 插件 | 领域图形 RectShape | 17 | 16 |
| plugins/builtin/shapes/TextShape.ts | 插件 | 领域图形 TextShape | 15 | 16 |
| plugins/dir/directory.ts | 插件 | 目录接口及 Node 文件系统适配器 | 17 | 3 |
| plugins/dir/index.ts | 插件 | 注册 dir 扩展 | 39 | 17 |
| plugins/stats/index.ts | 插件 | 注册 stats 扩展 | 41 | 9 |
| plugins/tree-star/index.ts | 插件 | 注册 tree-star 扩展 | 30 | 10 |
| src/api.ts | 内核 | 内核公开 API | 16 | 0 |
| src/cli.ts | 装配处 | CLI 参数和终端会话 | 38 | 16 |
| src/command/Command.ts | 内核 | 命令契约 | 29 | 0 |
| src/command/EditingCommand.ts | 内核 | 编辑快照和回滚 | 40 | 5 |
| src/command/SetCommand.ts | 内核 | 命令 Set | 40 | 13 |
| src/command/TreeCommand.ts | 内核 | 命令 Tree | 25 | 9 |
| src/editor/CommandDispatcher.ts | 内核 | 注册表分发 | 22 | 11 |
| src/editor/Editor.ts | 内核 | 命令执行和历史 | 52 | 21 |
| src/extension/Registry.ts | 内核 | 注册与暂存 | 78 | 30 |
| src/extension/contracts.ts | 内核 | 扩展点及公开契约 | 64 | 0 |
| src/host/codePlugins.ts | 装配处 | 代码方式装配 | 16 | 1 |
| src/host/createEditor.ts | 装配处 | 依赖创建和装配选择 | 38 | 12 |
| src/host/pluginLoader.ts | 装配处 | 配置、清单和激活事务 | 122 | 54 |
| src/io/FileService.ts | 内核 | SVG 文件读写 | 20 | 9 |
| src/io/SvgParser.ts | 内核 | XML 读回与 ID 分配 | 87 | 32 |
| src/model/ContainerShape.ts | 内核 | 领域图形 ContainerShape | 84 | 28 |
| src/model/EditorError.ts | 内核 | 领域错误 | 6 | 1 |
| src/model/Format.ts | 内核 | SVG 转义和数值格式 | 17 | 4 |
| src/model/Shape.ts | 内核 | 领域图形 Shape | 70 | 21 |
| src/model/ShapeFactory.ts | 内核 | 图形提供器选择 | 33 | 13 |
| src/model/SvgDocument.ts | 内核 | 根图形、编辑、序列化和树渲染 | 107 | 75 |
| src/parser/Tokenizer.ts | 内核 | 命令分词 | 16 | 10 |
| vscode-extension/src/extension.ts | VS Code | 注册 Explorer 装饰和 Outline | 49 | 16 |
| vscode-extension/src/outline.ts | VS Code | XML 符号层级和位置 | 49 | 11 |
