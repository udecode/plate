'use client';

import { TextApi } from 'platejs';
import {
  CodeBlockPlugin,
  definePlatePlugin,
  Plate,
  type PlateElementProps,
  useCreateEditor,
} from 'platejs/react';
import * as React from 'react';

import {
  CodeBlockElement,
  CodeBlockKit,
  createCodeBlockPlugin,
} from '@/registry/components/editor/code-block';
import { CodeBlockCodeMirrorElement } from '@/registry/components/editor/code-block-codemirror';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

const NativeCode = React.createContext(false);

function CodeElement(props: PlateElementProps<typeof CodeBlockPlugin>) {
  return React.useContext(NativeCode) ? (
    <CodeBlockElement {...props} />
  ) : (
    <CodeBlockCodeMirrorElement {...props} />
  );
}

const RangeHighlights = definePlatePlugin('codeRangeHighlights', {
  decorate: {
    read: ({ entry: [node, path] }) => {
      if (!TextApi.isText(node) || node.text.length < 12) return [];
      return [
        {
          key: 'note',
          range: { anchor: { path, offset: 0 }, focus: { path, offset: 12 } },
          attributes: {
            'data-code-note': '',
            style: { backgroundColor: '#facc1540' },
          },
        },
        {
          key: 'search',
          range: { anchor: { path, offset: 3 }, focus: { path, offset: 8 } },
          attributes: {
            'data-code-search': '',
            style: { textDecoration: 'underline' },
          },
        },
      ];
    },
  },
});
const plugins = [
  ...CodeBlockKit.map((plugin) =>
    plugin.name === CodeBlockPlugin.name
      ? createCodeBlockPlugin(CodeElement)
      : plugin
  ),
  RangeHighlights,
];

export default function CodeBlockViewsDemo() {
  const editor = useCreateEditor({
    plugins,
    initialValue: [
      {
        type: 'codeBlock',
        language: 'typescript',
        children: [{ text: 'const shared = 1;\nconst doubled = shared * 2;' }],
      },
    ],
  });

  return (
    <Plate editor={editor}>
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <section aria-label="CodeMirror view" className="space-y-2">
          <p>CodeMirror</p>
          <EditorContainer className="h-auto">
            <Editor id="code-codemirror-view" variant="none" />
          </EditorContainer>
        </section>
        <section aria-label="Native view" className="space-y-2">
          <p>Native Plate</p>
          <NativeCode.Provider value>
            <EditorContainer className="h-auto">
              <Editor id="code-native-view" variant="none" />
            </EditorContainer>
          </NativeCode.Provider>
        </section>
      </div>
    </Plate>
  );
}
