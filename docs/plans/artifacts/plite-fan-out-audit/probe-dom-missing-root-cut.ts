import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { plugin } from 'bun';

plugin({
  name: 'dom-missing-root-intervention',
  setup(build) {
    build.onLoad({ filter: /\/dom\/plugin\/dom-editor\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const original = 'resolveDOMNode: (editor, nodeOrKey) => {\n    let node: Node;';
      assert.ok(source.includes(original), 'DOM intervention must reach current owner.');
      return {
        contents: source.replace(original, 'resolveDOMNode: (editor, nodeOrKey) => {\n    if (nodeOrKey === editor) return DOMEditor.editable(editor);\n    if (EDITOR_TO_ELEMENT.get(editor)?.isConnected !== true) return null;\n    let node: Node;'),
        loader: 'ts',
      };
    });
  },
});
