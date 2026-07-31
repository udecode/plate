'use client';

import { BoldPlugin } from '@platejs/basic-nodes/react';
import { FontSizePlugin } from '@platejs/basic-styles/react';
import { CodeBlockPlugin, CodeLinePlugin } from '@platejs/code-block/react';
import { LinkPlugin } from '@platejs/link/react';
import { ListPlugin } from '@platejs/list/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@platejs/media/react';
import { ContentSlice, property } from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import { TablePlugin } from '@platejs/table/react';
import { useState } from 'react';
import {
  createPlatePlugin,
  ParagraphPlugin,
  Plate,
  PlateContent,
  useEditor,
  useEditorSelector,
  usePlateEditor,
} from 'platejs/react';

const CODEC_PROOF_FORMAT = 'application/x-plate-codec-proof';

type CodecProofPayload = {
  kind: 'block' | 'code' | 'delegate' | 'inline' | 'throw';
};

type CodecProofPluginState = {
  label: string;
};

const parseCodecProofPayload = (data: string): CodecProofPayload =>
  JSON.parse(data) as CodecProofPayload;

const CodecProofFallbackPlugin = createPlatePlugin({
  name: 'codecProofFallback',
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      [CODEC_PROOF_FORMAT]: {
        scope: 'document',
        decode: ({ data }) => {
          const { kind } = parseCodecProofPayload(data);

          if (kind !== 'delegate' && kind !== 'throw') return null;

          return ContentSlice.closed([
            {
              children: [{ text: `fallback:${kind}` }],
              type: 'p',
            },
          ]);
        },
      },
    }),
});

const codecProofInitialState: CodecProofPluginState = {
  label: 'initial',
};

const CodecProofPlugin = createPlatePlugin({
  initialState: codecProofInitialState,
  name: 'codecProof',
  codecs: ({ defineCodecs, editor, store }) =>
    defineCodecs({
      [CODEC_PROOF_FORMAT]: {
        priority: 20,
        scope: 'document',
        decode: ({ data }) => {
          const { kind } = parseCodecProofPayload(data);
          const { label } = store.get();

          if (kind === 'delegate') return null;
          if (kind === 'throw') {
            throw new Error('Expected Plate codec browser proof failure.');
          }
          if (kind === 'inline') {
            return ContentSlice.fromJSON({
              content: [
                {
                  children: [{ bold: true, text: `${label}:inline` }],
                  type: 'p',
                },
              ],
              openEnd: 1,
              openStart: 1,
            });
          }
          if (kind === 'code') {
            return ContentSlice.fromJSON({
              content: [
                {
                  children: [
                    {
                      children: [{ text: `${label}:code` }],
                      type: editor.plugin(CodeLinePlugin.name).type,
                    },
                  ],
                  type: editor.plugin(CodeBlockPlugin.name).type,
                },
              ],
              openEnd: 2,
              openStart: 2,
            });
          }

          return ContentSlice.closed([
            {
              children: [{ text: `${label}:block-a` }],
              type: 'p',
            },
            {
              children: [{ text: `${label}:block-b` }],
              type: 'p',
            },
          ]);
        },
        encode: ({ slice }) =>
          JSON.stringify({
            label: store.get('label'),
            slice,
          }),
      },
    }),
});

const AdvancedMarkPlugin = createPlatePlugin({
  name: 'schemaAdvanced',
  schema: {
    mark: {
      inclusive: false,
      property: property.string(),
      split: 'preserve',
      typeChange: 'preserve-if-allowed',
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.getAttribute('data-schema-advanced') ?? undefined,
        encode: ({ value }) => ({
          attributes: { 'data-schema-advanced': value },
          tag: 'mark',
        }),
        match: [{ attributes: { 'data-schema-advanced': true } }],
      },
    }),

  render: { as: 'mark' },
});

const PlateSchemaDescriptorControls = () => {
  const editor = useEditor();
  const [codecLabel, setCodecLabel] = useState('initial');
  const [encodedSlice, setEncodedSlice] = useState('');
  const document = useEditorSelector((editor) =>
    JSON.stringify(editor.read.children())
  );
  const advancedMark = editor.read.schema.property(AdvancedMarkPlugin);
  const insertCodecProof = (kind: CodecProofPayload['kind']) => {
    const data = new DataTransfer();

    data.setData(CODEC_PROOF_FORMAT, JSON.stringify({ kind }));
    editor.api.dom.clipboard.insertData(data);
  };
  const insertMarkdownMime = () => {
    const data = new DataTransfer();

    data.setData('text/markdown', '**Markdown MIME**');
    data.setData('text/plain', 'plain loser');
    editor.api.dom.clipboard.insertData(data);
  };
  const resetInlineTarget = () => {
    editor.update.value.replace({
      children: [
        {
          children: [{ text: 'left  right' }],
          type: 'p',
        },
      ],
      selection: {
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
        kind: 'text',
      },
    });
  };
  const resetBlockTarget = () => {
    editor.update.value.replace({
      children: [{ children: [{ text: '' }], type: 'p' }],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
    });
  };
  const loadRichDescriptorDocument = () => {
    editor.update.value.replace({
      children: [
        {
          children: [
            {
              bold: true,
              schemaAdvanced: 'rich-proof',
              text: 'Rich descriptor text',
            },
            { text: ' with ' },
            {
              children: [{ text: 'a link' }],
              target: '_self',
              type: editor.plugin(LinkPlugin.name).type,
              url: 'https://example.com/docs',
            },
          ],
          type: 'p',
        },
        {
          children: [{ text: 'Modern list item' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          children: [
            {
              children: [
                {
                  background: '#fef3c7',
                  borders: {
                    bottom: {
                      color: '#92400e',
                      size: 2,
                      style: 'solid',
                    },
                  },
                  children: [
                    {
                      children: [{ text: 'Table cell' }],
                      type: 'p',
                    },
                  ],
                  size: 180,
                  type: 'td',
                },
              ],
              size: 44,
              type: 'tr',
            },
          ],
          colSizes: [180],
          marginLeft: 12,
          type: 'table',
        },
        {
          children: [
            {
              children: [{ text: 'const codec = true;' }],
              type: editor.plugin(CodeLinePlugin.name).type,
            },
            {
              children: [{ text: '' }],
              type: editor.plugin(CodeLinePlugin.name).type,
            },
          ],
          lang: 'typescript',
          type: editor.plugin(CodeBlockPlugin.name).type,
        },
        {
          alt: 'Plate codec image',
          children: [{ text: 'Image caption' }],
          initialHeight: 180,
          initialWidth: 320,
          type: editor.plugin(ImagePlugin.name).type,
          url: 'https://example.com/plate-codec.png',
          width: '50%',
        },
        {
          children: [{ text: 'Media caption' }],
          provider: 'youtube',
          sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
          type: editor.plugin(MediaEmbedPlugin.name).type,
          url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
          width: 480,
        },
      ],
      selection: null,
    });
  };
  const resetCodeTarget = () => {
    editor.update.value.replace({
      children: [
        {
          children: [
            {
              children: [{ text: 'left  right' }],
              type: editor.plugin(CodeLinePlugin.name).type,
            },
          ],
          type: editor.plugin(CodeBlockPlugin.name).type,
        },
      ],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
    });
  };
  const encodeRootedSlice = () => {
    const data = new DataTransfer();

    writeHostFragmentData(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [
          {
            children: [{ text: 'main' }],
            type: 'p',
          },
        ],
        openEnd: 0,
        openStart: 0,
        roots: {
          notes: [
            {
              children: [{ text: 'named' }],
              type: 'p',
            },
          ],
          'projected:body': [
            {
              children: [{ text: 'projected' }],
              type: 'p',
            },
          ],
        },
      })
    );
    setEncodedSlice(data.getData(CODEC_PROOF_FORMAT));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2" contentEditable={false}>
        <button
          className="rounded border px-3 py-1"
          onClick={() => {
            const children = editor.api.html.deserialize({
              element:
                '<p><strong><span style="font-size: 22px"><mark data-schema-advanced="proof">Descriptor proof</mark></span></strong></p>',
            });

            editor.update.value.replace({ children, selection: null });
          }}
          type="button"
        >
          Import Plate descriptor HTML
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={loadRichDescriptorDocument}
          type="button"
        >
          Load rich descriptor document
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={resetInlineTarget}
          type="button"
        >
          Reset inline codec target
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={resetBlockTarget}
          type="button"
        >
          Reset block codec target
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={resetCodeTarget}
          type="button"
        >
          Reset code codec target
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={insertMarkdownMime}
          type="button"
        >
          Import Markdown MIME
        </button>
        {(
          [
            ['Import inline codec slice', 'inline'],
            ['Import block codec slice', 'block'],
            ['Import code codec slice', 'code'],
            ['Import delegated codec slice', 'delegate'],
            ['Import throwing codec slice', 'throw'],
          ] as const
        ).map(([label, kind]) => (
          <button
            className="rounded border px-3 py-1"
            key={kind}
            onClick={() => insertCodecProof(kind)}
            type="button"
          >
            {label}
          </button>
        ))}
        <button
          className="rounded border px-3 py-1"
          onClick={() => {
            editor.plugin(CodecProofPlugin).store.set({ label: 'replacement' });
            setCodecLabel('replacement');
          }}
          type="button"
        >
          Use replacement codec state
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={encodeRootedSlice}
          type="button"
        >
          Encode rooted Plate slice
        </button>
      </div>
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
      <output data-test-id="plate-codec-label">{codecLabel}</output>
      <output className="sr-only" data-test-id="plate-codec-encoded-slice">
        {encodedSlice}
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
      ParagraphPlugin.configure({
        render: { as: 'article' },
      }),
      BoldPlugin,
      FontSizePlugin,
      AdvancedMarkPlugin,
      LinkPlugin,
      ListPlugin,
      TablePlugin,
      CodeLinePlugin,
      CodeBlockPlugin,
      ImagePlugin,
      MediaEmbedPlugin,
      CodecProofFallbackPlugin,
      CodecProofPlugin,
      MarkdownPlugin.configure({
        initialState: {
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
