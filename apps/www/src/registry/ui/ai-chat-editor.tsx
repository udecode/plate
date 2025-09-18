'use client';

import * as React from 'react';

import { AIChatPlugin, useAIChatEditor } from '@platejs/ai/react';
import { usePlateEditor, usePluginOption } from 'platejs/react';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

import { EditorStatic } from './editor-static';

export const AIChatEditor = React.memo(function AIChatEditor({
  content,
}: {
  content: string;
}) {
  const toolName = usePluginOption(AIChatPlugin, 'toolName');

  const aiEditor = usePlateEditor({
    plugins: BaseEditorKit,
  });

  useAIChatEditor(aiEditor, content);

  if (toolName === 'generate') {
    return <EditorStatic variant="aiChat" editor={aiEditor} />;
  }
  return null;
});
