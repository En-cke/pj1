import { expect, it } from "vitest";
import { ModifiedStar } from "../plugins/tree-star/index.js";
import { ContainerShape, EditingCommand, SvgDocument } from "../src/api.js";

class ChangeStyle extends EditingCommand {
  protected apply(document: SvgDocument): string {
    document.require("item").setAttribute("fill", "red");
    return "changed";
  }
}

it("recomputes edited, saved, re-edited, undo and redo states from document snapshots", () => {
  const document = new SvgDocument();
  const outer = new ContainerShape("outer");
  document.add(outer);
  document.add(new ContainerShape("item"), "outer");
  const label = new ModifiedStar();
  let saved: SvgDocument | undefined;
  const ask = (id?: string) => label.label({ document, saved, shape: id ? document.require(id) : undefined });
  expect([ask(), ask("outer"), ask("item")]).toEqual(["*", "*", "*"]);
  const standalone = {
    document, requireDocument: () => document, markSaved: () => { saved = document.clone(); },
    undo: () => "", redo: () => "",
  };
  standalone.markSaved();
  expect([ask(), ask("outer"), ask("item")]).toEqual([undefined, undefined, undefined]);

  const change = new ChangeStyle();
  change.execute(standalone);
  expect([ask(), ask("outer"), ask("item")]).toEqual(["*", undefined, "*"]);
  change.undo(standalone);
  expect([ask(), ask("outer"), ask("item")]).toEqual([undefined, undefined, undefined]);
  change.redo(standalone);
  expect([ask(), ask("outer"), ask("item")]).toEqual(["*", undefined, "*"]);
  standalone.markSaved();
  expect([ask(), ask("outer"), ask("item")]).toEqual([undefined, undefined, undefined]);
  document.add(new ContainerShape("new"), "item");
  expect([ask(), ask("outer"), ask("item"), ask("new")]).toEqual(["*", undefined, "*", "*"]);
});
