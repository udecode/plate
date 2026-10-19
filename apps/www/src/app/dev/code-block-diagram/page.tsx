'use client';

import { useSearchParams } from 'next/navigation';
import {
  CodeBlockPlugin,
  CodeHighlightPlugin,
  EditorRoot,
  useCreateEditor,
} from 'platejs/react';
import { Activity, Suspense, useState } from 'react';

import {
  type CodeBlockComponent,
  CodeBlockElement,
  createCodeBlockPlugin,
} from '@/registry/components/editor/code-block';
import { CodeBlockCodeMirrorElement } from '@/registry/components/editor/code-block-codemirror';
import {
  type DiagramRenderer,
  withDiagrams,
} from '@/registry/components/editor/code-block-diagram';
import { graphvizRenderer } from '@/registry/components/editor/code-block-diagram-graphviz';
import { mermaidRenderer } from '@/registry/components/editor/code-block-diagram-mermaid';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

type ProbeWindow = Window & {
  __diagramInFlight?: number;
  __diagramMaxInFlight?: number;
  __diagramRenders?: string[];
  __releaseRenders?: () => void;
};

const heldRenders: Array<() => void> = [];

const applyRouteOptions = async () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('hold') === '1') {
    (window as ProbeWindow).__releaseRenders = () => {
      for (const release of heldRenders.splice(0)) release();
    };
    await new Promise<void>((resolve) => {
      heldRenders.push(resolve);
    });
  }

  return params;
};

const withRenderProbe = (renderer: DiagramRenderer): DiagramRenderer => ({
  ...renderer,
  render: async (source, options) => {
    const probe = window as ProbeWindow;

    probe.__diagramRenders ??= [];
    probe.__diagramRenders.push(source);
    probe.__diagramInFlight = (probe.__diagramInFlight ?? 0) + 1;
    probe.__diagramMaxInFlight = Math.max(
      probe.__diagramMaxInFlight ?? 0,
      probe.__diagramInFlight
    );

    try {
      const params = await applyRouteOptions();

      if (params.get('output') === 'html') return '<div>not a picture</div>';

      return await renderer.render(source, options);
    } finally {
      probe.__diagramInFlight = (probe.__diagramInFlight ?? 1) - 1;
    }
  },
});

const renderers = [
  withRenderProbe(mermaidRenderer),
  withRenderProbe(graphvizRenderer),
];

const createPlugins = (element: CodeBlockComponent, codeMirror: boolean) =>
  EditorKit.filter(
    (plugin) => !codeMirror || plugin.name !== CodeHighlightPlugin.name
  ).map((plugin) =>
    plugin.name === CodeBlockPlugin.name
      ? createCodeBlockPlugin(withDiagrams(element, { renderers }))
      : plugin
  );

const nativePlugins = createPlugins(CodeBlockElement, false);
const codeMirrorPlugins = createPlugins(CodeBlockCodeMirrorElement, true);

const createValue = (language: string, source: string) => [
  { children: [{ text: 'Above the diagram' }], type: 'paragraph' },
  { children: [{ text: source }], language, type: 'codeBlock' },
  { children: [{ text: 'Below the diagram' }], type: 'paragraph' },
];

function CodeBlockDiagramProbe() {
  const params = useSearchParams();
  const codeMirror = params?.get('variant') === 'codemirror';
  const editor = useCreateEditor({
    initialValue: createValue(
      params?.get('language') ?? 'mermaid',
      params?.get('source') ?? 'graph TD\n  A-->B\n  B-->C'
    ),
    plugins: codeMirror ? codeMirrorPlugins : nativePlugins,
  });
  const [hidden, setHidden] = useState(false);

  return (
    <>
      {params?.get('activity') === '1' && (
        <button type="button" onClick={() => setHidden((value) => !value)}>
          {hidden ? 'Show editor' : 'Hide editor'}
        </button>
      )}
      <Activity mode={hidden ? 'hidden' : 'visible'}>
        <EditorRoot editor={editor}>
          <EditorContainer>
            <Editor readOnly={params?.get('readOnly') === '1'} />
          </EditorContainer>
        </EditorRoot>
      </Activity>
    </>
  );
}

export default function CodeBlockDiagramProbePage() {
  return (
    <Suspense fallback={<p>Loading diagram proof…</p>}>
      <CodeBlockDiagramProbe />
    </Suspense>
  );
}
