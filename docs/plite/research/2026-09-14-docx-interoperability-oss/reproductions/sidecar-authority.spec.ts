// Historical failing-behavior observation, not a product acceptance test.
// A repair should invalidate these observed-bug assertions.
import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { authored } from "../../../../../packages/platejs/src/authored";
import { createEditor } from "../../../../../packages/platejs/src/core";
import { BaseParagraphPlugin } from "../../../../../packages/platejs/src/lib";
import { exportAuthoredToDocx } from "../../../../../packages/platejs/src/docx/export/lib/authoredDocx";
import { importDocx } from "../../../../../packages/platejs/src/docx/import/lib/importDocx";

const require = createRequire(
  new URL("../../../../../packages/platejs/package.json", import.meta.url)
);
const JSZip = require("jszip");

test("research reproduction: private sidecar overrides edited Word content", async () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, authored({ authorId: "alice" })],
    initialValue: [{ type: "paragraph", children: [{ text: "ORIGINAL" }] }],
  });
  const result = await exportAuthoredToDocx(editor, { projection: "review" });
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  const original = await zip.file("word/document.xml").async("string");
  const envelope = await zip.file("editor/authored.json").async("string");
  expect(original).toContain("ORIGINAL");
  zip.file("word/document.xml", original.replace("ORIGINAL", "EDITED"));
  expect(await zip.file("word/document.xml").async("string")).toContain(
    "EDITED"
  );
  expect(await zip.file("editor/authored.json").async("string")).toBe(envelope);
  const withSidecar = await importDocx(
    editor,
    await zip.generateAsync({ type: "arraybuffer" })
  );
  expect(withSidecar.nodes[0].children[0].text).toBe("ORIGINAL");
  expect(withSidecar.warnings).toEqual([]);
  zip.remove("editor/authored.json");
  const withoutSidecar = await importDocx(
    editor,
    await zip.generateAsync({ type: "arraybuffer" })
  );
  expect(withoutSidecar.nodes[0].children[0].text).toBe("EDITED");
  console.log(
    JSON.stringify({
      proof: "sidecar-authority",
      withSidecar: withSidecar.nodes,
      warnings: withSidecar.warnings,
      withoutSidecar: withoutSidecar.nodes,
    })
  );
});

test("research reproduction: export captures different Word and native states", async () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, authored({ authorId: "alice" })],
    initialValue: [{ type: "paragraph", children: [{ text: "ORIGINAL" }] }],
  });
  const pending = exportAuthoredToDocx(editor, { projection: "review" });
  editor.update.text.insert("LATE", { at: { path: [0, 0], offset: 8 } });
  const result = await pending;
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  const xml = await zip.file("word/document.xml").async("string");
  const envelope = JSON.parse(
    await zip.file("editor/authored.json").async("string")
  );
  expect(xml).toContain("ORIGINAL");
  expect(xml).not.toContain("LATE");
  expect(envelope.children[0].children[0].text).toBe("ORIGINALLATE");
  console.log(
    JSON.stringify({
      proof: "mixed-export-snapshots",
      wordHasLate: xml.includes("LATE"),
      envelopeText: envelope.children[0].children[0].text,
    })
  );
});
