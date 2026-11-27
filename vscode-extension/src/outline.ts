import { SaxesParser } from "saxes";

export interface SvgSymbol {
  name: string;
  start: number;
  end: number;
  nameStart: number;
  nameEnd: number;
  children: SvgSymbol[];
}

export function parseOutline(xml: string): SvgSymbol[] {
  const roots: SvgSymbol[] = [];
  const stack: SvgSymbol[] = [];
  const parser = new SaxesParser();
  let start = 0;
  let rootTag = "";

  parser.on("opentagstart", () => {
    start = xml.lastIndexOf("<", parser.position - 1);
  });
  parser.on("opentag", ({ name, attributes }) => {
    if (stack.length === 0) rootTag = name;
    const id = attributes.id;
    const symbol: SvgSymbol = {
      name: id ? name + "#" + id : name,
      start,
      end: parser.position,
      nameStart: start + 1,
      nameEnd: start + 1 + name.length,
      children: [],
    };
    const siblings = stack.at(-1)?.children ?? roots;
    siblings.push(symbol);
    stack.push(symbol);
  });
  parser.on("closetag", () => {
    const symbol = stack.pop();
    if (symbol) symbol.end = parser.position;
  });

  try {
    parser.write(xml).close();
  } catch {
    return [];
  }

  return roots.length === 1 && /(^|:)svg$/.test(rootTag) ? roots : [];
}
