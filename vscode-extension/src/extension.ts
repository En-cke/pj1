import * as vscode from "vscode";
import { parseOutline, type SvgSymbol } from "./outline";

function isSvgPath(path: string): boolean {
  return path.toLowerCase().endsWith(".svg");
}

class SvgBadgeProvider implements vscode.FileDecorationProvider {
  async provideFileDecoration(uri: vscode.Uri, token: vscode.CancellationToken) {
    if (!isSvgPath(uri.path) || token.isCancellationRequested) return;
    try {
      const { type } = await vscode.workspace.fs.stat(uri);
      if ((type & vscode.FileType.File) && !token.isCancellationRequested) {
        return new vscode.FileDecoration("[]", "SVG file");
      }
    } catch {
      // The entry may disappear between Explorer rendering and stat.
    }
  }
}

class SvgOutlineProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
    if (!isSvgPath(document.uri.path) || token.isCancellationRequested) return [];
    return parseOutline(document.getText()).map(node => this.toSymbol(document, node));
  }

  private toSymbol(document: vscode.TextDocument, node: SvgSymbol): vscode.DocumentSymbol {
    const range = (start: number, end: number) =>
      new vscode.Range(document.positionAt(start), document.positionAt(end));
    const symbol = new vscode.DocumentSymbol(
      node.name, "", node.children.length ? vscode.SymbolKind.Namespace : vscode.SymbolKind.Field,
      range(node.start, node.end), range(node.nameStart, node.nameEnd),
    );
    symbol.children = node.children.map(child => this.toSymbol(document, child));
    return symbol;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(new SvgBadgeProvider()),
    vscode.languages.registerDocumentSymbolProvider(
      [{ pattern: "**/*.svg" }, { language: "xml" }, { language: "plaintext" }],
      new SvgOutlineProvider(),
      { label: "SVG" },
    ),
  );
}
