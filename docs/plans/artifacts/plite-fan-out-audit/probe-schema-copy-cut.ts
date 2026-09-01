import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { plugin } from 'bun';

plugin({
  name: 'schema-copy-policy-intervention',
  setup(build) {
    build.onLoad({ filter: /\/core\/editor-schema\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const original = 'return schema\n      ? copyDeclarativeChildren(children, schema, root, ancestors)\n      : children;';
      assert.ok(source.includes(original), 'Copy intervention must reach the current owner.');
      return {
        contents: source.replace(original, 'return schema && [...schema.properties.byId.values()].some((property) => property.lifecycle.copy === "drop")\n      ? copyDeclarativeChildren(children, schema, root, ancestors)\n      : children;'),
        loader: 'ts',
      };
    });
  },
});
