const assert = require("node:assert/strict");
const { test } = require("node:test");
const { parseOutline } = require("../dist/outline.js");

test("nested group, unnamed leaf and exact source ranges", () => {
  const xml = '<?xml version="1.0"?>\r\n<svg>\n<!-- <line/> -->\n<g id="a"><g id="b"><rect id="start"/></g><text>开始</text></g></svg>';
  const [root] = parseOutline(xml);
  const [group] = root.children;
  const [nested, text] = group.children;
  const [rect] = nested.children;
  assert.deepEqual([root.name, group.name, nested.name, rect.name, text.name],
    ["svg", "g#a", "g#b", "rect#start", "text"]);
  assert.equal(xml.slice(rect.start, rect.end), '<rect id="start"/>');
  assert.equal(xml.slice(rect.nameStart, rect.nameEnd), "rect");
  assert.equal(xml.slice(text.start, text.end), "<text>开始</text>");
});

test("edited text is reparsed; incomplete XML clears and then recovers", () => {
  assert.equal(parseOutline('<svg><g id="before"/></svg>')[0].children[0].name, "g#before");
  for (const xml of ["<svg><g", "<svg><g></svg>", "", "<svg/><svg/>", "<html/>"]) {
    assert.deepEqual(parseOutline(xml), []);
  }
  assert.equal(parseOutline('<svg><g id="after"/></svg>')[0].children[0].name, "g#after");
});
