'use client';

import {
  CodeBlockPlugin,
  CodeHighlightPlugin,
  Plate,
  useCreateEditor,
} from 'platejs/react';

import { createCodeBlockPlugin } from '@/registry/components/editor/code-block';
import { CodeBlockCodeMirrorElement } from '@/registry/components/editor/code-block-codemirror';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

import { createValue } from './values/demo-values';

const codeBlockCodeMirrorPlugin = createCodeBlockPlugin(
  CodeBlockCodeMirrorElement
);
const CodeBlockCodeMirrorDemoKit = EditorKit.filter(
  (plugin) => plugin.name !== CodeHighlightPlugin.name
).map((plugin) =>
  plugin.name === CodeBlockPlugin.name ? codeBlockCodeMirrorPlugin : plugin
);

export default function CodeBlockCodeMirrorDemo({ id }: { id: string }) {
  const editor = useCreateEditor({
    plugins: CodeBlockCodeMirrorDemoKit,
    initialValue: createValue(id),
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
