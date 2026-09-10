import assert from 'node:assert/strict';
import { it } from 'node:test';

import { defineEditorSchema, property, schema, target } from 'plitejs';

import {
  compileEditorSchemaContributions,
  resolveCompiledSchemaProperty,
} from '../src/core/schema-compiler';

for (const placement of ['element', 'text'] as const) {
  it(`resolves contextual exact and overlapping prefix ${placement} properties`, () => {
    const makeProperty =
      placement === 'element' ? schema.elementProperty : schema.textProperty;
    const definition = defineEditorSchema(`schema:lookup-${placement}`, {
      id: `lookup-${placement}`,
      version: 1,
      unknown: 'reject',
      elements: {
        p: { content: schema.content.text() },
        q: { content: schema.content.text() },
        r: { content: schema.content.text() },
      },
      root: schema.content.types(['p', 'q', 'r']),
      properties: [
        makeProperty('meta_state', property.string(), {
          target: target.type('p'),
        }),
        makeProperty(schema.key.prefix('meta_'), property.string(), {
          target: target.type('q'),
        }),
        makeProperty(schema.key.prefix('meta_state_'), property.string(), {
          target: target.type('r'),
        }),
      ],
    });
    const compiled = compileEditorSchemaContributions([
      { extensionName: definition.name, contribution: definition.schema },
    ]);
    const lookup = (key: string, type: string) =>
      resolveCompiledSchemaProperty(compiled, placement, key, {
        root: null,
        type,
      });
    assert.equal(lookup('meta_state', 'p')?.key, 'meta_state');
    assert.deepEqual(
      lookup('meta_state', 'q')?.key,
      schema.key.prefix('meta_')
    );
    assert.deepEqual(
      lookup('meta_state_value', 'q')?.key,
      schema.key.prefix('meta_')
    );
    assert.deepEqual(
      lookup('meta_state_value', 'r')?.key,
      schema.key.prefix('meta_state_')
    );
    assert.equal(lookup('meta_state_value', 'p'), null);
    assert.equal(lookup('meta_state', 'r'), null);
    assert.equal(lookup('unmatched', 'p'), null);
  });
}
