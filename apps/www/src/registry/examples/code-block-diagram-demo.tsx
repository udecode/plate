'use client';

import { CodeBlockPlugin, EditorRoot, useCreateEditor } from 'platejs/react';

import {
  CodeBlockElement,
  createCodeBlockPlugin,
} from '@/registry/components/editor/code-block';
import { withDiagrams } from '@/registry/components/editor/code-block-diagram';
import { flowchartRenderer } from '@/registry/components/editor/code-block-diagram-flowchart';
import { graphvizRenderer } from '@/registry/components/editor/code-block-diagram-graphviz';
import { mermaidRenderer } from '@/registry/components/editor/code-block-diagram-mermaid';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { codeBlockDiagramValue } from '@/registry/examples/values/code-block-diagram-value';

const diagramCodeBlockPlugin = createCodeBlockPlugin(
  withDiagrams(CodeBlockElement, {
    renderers: [mermaidRenderer, graphvizRenderer, flowchartRenderer],
  })
);
const plugins = EditorKit.map((plugin) =>
  plugin.name === CodeBlockPlugin.name ? diagramCodeBlockPlugin : plugin
);

export default function CodeBlockDiagramDemo() {
  const editor = useCreateEditor({
    plugins,
    initialValue: codeBlockDiagramValue,
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
