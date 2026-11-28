'use client';

import { TrailingBlockPlugin } from 'platejs';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import {
  CodeBlockCodeMirrorElement,
  resolveCodeMirrorLanguage,
} from '@/registry/components/editor/code-block-codemirror';
import { createCodeBlockPlugin } from '@/registry/components/editor/code-block-container';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { ExitBreakKit } from '@/registry/components/editor/exit-break';

import { hugeCodeBlockValue } from './values/huge-code-block-value';

const plugins = [
  ...BasicBlocksKit,
  ...BasicMarksKit,
  createCodeBlockPlugin(CodeBlockCodeMirrorElement, {
    normalizeLanguage: resolveCodeMirrorLanguage,
  }),
  ...ExitBreakKit,
  TrailingBlockPlugin,
];

export default function CodeBlockCodeMirrorDemo() {
  const editor = useCreateEditor({
    plugins,
    initialValue: hugeCodeBlockValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
