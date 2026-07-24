'use client';

import { BoldPlugin } from '@platejs/basic-nodes/react';
import { FontSizePlugin } from '@platejs/basic-styles/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { property } from '@platejs/plite';
import { HtmlPlugin } from 'platejs';
import {
  createPlatePlugin,
  ParagraphPlugin,
  Plate,
  PlateContent,
  useEditor,
  useEditorSelector,
  usePlateEditor,
} from 'platejs/react';

const AdvancedMarkPlugin = createPlatePlugin({
  key: 'schemaAdvanced',
  parsers: {
    html: {
      deserializer: {
        parse: ({ element, type }) => ({
          [type]: element.getAttribute('data-schema-advanced'),
        }),
        rules: [{ validAttribute: 'data-schema-advanced' }],
      },
    },
  },
  render: { as: 'mark' },
  schema: {
    mark: {
      inclusive: false,
      property: property.string(),
      split: 'preserve',
      typeChange: 'preserve-if-allowed',
    },
  },
});

const PlateSchemaDescriptorControls = () => {
  const editor = useEditor();
  const document = useEditorSelector((editor) =>
    JSON.stringify(editor.read.children())
  );
  const advancedMark = editor.read.schema.property(AdvancedMarkPlugin);

  return (
    <>
      <button
        className="rounded border px-3 py-1"
        onClick={() => {
          const children = editor.plugin(HtmlPlugin).api.deserialize({
            element:
              '<p><strong><span style="font-size: 22px"><mark data-schema-advanced="proof">Descriptor proof</mark></span></strong></p>',
          });

          editor.update.value.replace({ children, selection: null });
        }}
        type="button"
      >
        Import Plate descriptor HTML
      </button>
      <output data-test-id="plate-schema-descriptor-policy">
        {advancedMark
          ? [
              advancedMark.value.kind,
              advancedMark.lifecycle.inclusive,
              advancedMark.lifecycle.split,
              advancedMark.lifecycle.typeChange,
            ].join(':')
          : 'missing'}
      </output>
      <output className="sr-only" data-test-id="plate-schema-document">
        {document}
      </output>
    </>
  );
};

const PlateSchemaDescriptorsExample = () => {
  const editor = usePlateEditor({
    plugins: [
      ParagraphPlugin.extend({
        render: { as: 'article' },
      }),
      BoldPlugin,
      FontSizePlugin,
      AdvancedMarkPlugin,
      MarkdownPlugin.configure({
        options: {
          plainMarks: ['fontSize', 'schemaAdvanced'],
        },
      }),
    ],
    initialValue: [{ children: [{ text: '' }], type: 'p' }],
  });

  return (
    <Plate editor={editor}>
      <div className="flex flex-col gap-2">
        <PlateSchemaDescriptorControls />
        <PlateContent
          aria-label="Plate schema descriptor editor"
          className="min-h-24 rounded border p-3"
          id="plate-schema-descriptor-editor"
        />
      </div>
    </Plate>
  );
};

export default PlateSchemaDescriptorsExample;
