# SVG Lab Outline

在本目录执行 `npm ci`、`npm run build`。用 VS Code 打开本目录并按 F5，选择 **Run SVG extension**。在扩展开发宿主打开 `demo/example.svg`，并展开 Explorer 的 Outline。若编辑器打开了图片预览，使用 **Reopen Editor With → Text Editor**。

- `example.svg` 文件显示 `[]`，`notes.txt` 和同样以 .svg 结尾的目录 `assets.svg` 无标记。
- 点选 `rect#start` 检查源码定位。将 `start` 改成其他 id 检查大纲更新，暂时破坏闭合标签检查大纲清空，撤销后检查恢复。
- `npm test` 检查嵌套、无 id 节点、位置、编辑更新和不完整 XML。

文件标记和大纲通过 [VS Code Extension API](https://code.visualstudio.com/api/references/vscode-api) 注册。宿主决定何时按 URI 请求装饰、何时从当前文本快照查询符号，并负责 Explorer 绘制、原生大纲刷新和跳转。装饰提供器组合文件系统查询与附加元数据，效果类似 Decorator 的附加职责。经典 Decorator 与被包装对象共享接口并转发调用，这里没有包装文件对象或代替 VS Code 渲染。大纲提供器把 XML 节点与源码偏移适配为 VS Code 的 DocumentSymbol。

Phase 1 的树遍历和 Composite 思路可参考。它的解析器仅建立受支持的可编辑图形，会为匿名节点分配 id，且未暴露可用于编辑器定位的源码范围。扩展用严格 XML 解析获知所有标签及其偏移，不导入 CLI 模型，也不会替源文件生成 id。
