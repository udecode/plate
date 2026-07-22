import { createEditor, defineEditorSchema, schema } from '@platejs/plite';
import {
  createEditorFixture,
  createHyperscript,
} from '@platejs/plite-hyperscript';
import { createElement } from '../packages/plite-hyperscript/src/creators.ts';
import {
  initializeEditorSchemaDocument,
  setCurrentSelection,
} from '../packages/plite/src/core/public-state.ts';

export const getFixtureElementType = (tagName, attributes = {}) => {
  const inline = tagName === 'inline' || attributes.inline === true;
  const flags = [
    inline ? 'inline' : 'block',
    attributes.void === true ? 'void' : null,
    attributes.markable === true ? 'markable' : null,
    attributes.readOnly === true ? 'read-only' : null,
    attributes.nonSelectable === true ? 'non-selectable' : null,
  ].filter(Boolean);

  return `fixture-${flags.join('-')}`;
};

const createFixtureElement = (tagName, attributes, children) =>
  createElement(
    tagName,
    {
      ...attributes,
      type: attributes.type ?? getFixtureElementType(tagName, attributes),
    },
    children
  );

const fixtureElements = {};
const inlineContent = schema.content.any(
  [schema.content.text(), schema.content.group('inline')],
  { default: 'text', min: 1 }
);

for (const inline of [false, true]) {
  for (const isVoid of [false, true]) {
    for (const markable of [false, true]) {
      for (const readOnly of [false, true]) {
        for (const nonSelectable of [false, true]) {
          const attributes = {
            inline,
            markable,
            nonSelectable,
            readOnly,
            void: isVoid,
          };
          const type = getFixtureElementType(
            inline ? 'inline' : 'block',
            attributes
          );

          fixtureElements[type] = {
            ...(!isVoid
              ? {
                  content: inline ? inlineContent : schema.content.open(),
                }
              : {}),
            groups: ['fixture'],
            inline,
            readOnly,
            selectable: !nonSelectable,
            ...(isVoid
              ? {
                  void: inline
                    ? markable
                      ? 'markable-inline'
                      : 'inline'
                    : 'block',
                }
              : {}),
          };
        }
      }
    }
  }
}

export const fixtureSchema = defineEditorSchema({
  elements: fixtureElements,
  groups: { fixture: {} },
  id: 'fixture-schema',
  root: {
    content: schema.content.not(schema.content.text()),
  },
  unknown: 'preserve',
  version: 1,
});

const createFixtureEditor = (tagName, attributes, children) => {
  const fixture = createEditorFixture(tagName, {}, children);
  const editor = createEditor({
    extensions: [fixtureSchema],
  });

  initializeEditorSchemaDocument(editor, { children: fixture.children });
  if (fixture.selection) setCurrentSelection(editor, fixture.selection);

  Object.assign(editor, attributes);

  return editor;
};

export const jsx = createHyperscript({
  creators: {
    block: createFixtureElement,
    editor: createFixtureEditor,
    element: createFixtureElement,
    inline: createFixtureElement,
  },
});

globalThis.jsx = jsx;
