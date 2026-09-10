'use client';

import { NodeApi } from 'platejs';
import type { AIChatRequestContext } from 'platejs/ai';
import { AIChatPlugin } from 'platejs/ai/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

function ClipboardDestination() {
  const editor = useCreateEditor(
    {
      plugins: EditorKit,
      initialValue: [paragraph('')],
    },
    []
  );
  const [value, setValue] = React.useState(() => editor.read.value());
  const [paste, setPaste] = React.useState('');
  return (
    <section
      aria-label="Clipboard destination"
      onPasteCapture={(event) =>
        setPaste(
          JSON.stringify({
            trusted: event.nativeEvent.isTrusted,
            types: event.clipboardData.types,
            html: event.clipboardData.getData('text/html'),
            text: event.clipboardData.getData('text/plain'),
          })
        )
      }
    >
      <h2>Clipboard destination</h2>
      <Plate
        editor={editor}
        onValueChange={({ value: nextValue }) => setValue(nextValue)}
      >
        <EditorContainer>
          <Editor aria-label="Clipboard destination editor" />
        </EditorContainer>
      </Plate>
      <pre data-ai-clipboard-value>{JSON.stringify(value)}</pre>
      <pre data-ai-clipboard-paste>{paste}</pre>
    </section>
  );
}

/** Development proof host for the actual copied editor and draft components. */
export function AIStreamingProof() {
  const editor = useCreateEditor(
    {
      plugins: EditorKit,
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Before ', bold: true },
            { text: 'selected', italic: true },
            { text: ' after.', underline: true },
          ],
        },
        paragraph('Untouched tail.'),
      ],
    },
    []
  );
  const ai = editor.plugin(AIChatPlugin);
  const [source, setSource] = React.useState('replacement');
  const [showClipboard, setShowClipboard] = React.useState(false);
  const [constrained, setConstrained] = React.useState(false);
  const [bytes, setBytes] = React.useState(1024);
  const [background, setBackground] = React.useState(0);
  const [chunk, setChunk] = React.useState(128);
  const [mode, setMode] = React.useState<'insert' | 'edit' | 'dialog'>(
    'insert'
  );
  const [shape, setShape] = React.useState('paragraphs');
  const [report, setReport] = React.useState('');
  const request = React.useRef<number | undefined>(undefined);
  const snapshot = () =>
    setReport(
      JSON.stringify({
        value: editor.read.value(),
        selection: editor.read.selection(),
        history: editor.read.history.undos().length,
        operation: ai.store.get('operation'),
      })
    );
  const start = () => {
    ai.api.reset();
    editor.update.selection.set({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 8 },
    });
    ai.api.show();
    editor.api.dom.focus();
    request.current = ai.api.start({ mode: 'chat', toolName: 'edit' });
    snapshot();
  };
  const comment = () => {
    ai.api.show();
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 7 },
    });
    editor.api.dom.focus();
    let context: AIChatRequestContext | undefined;
    ai.store.set({
      chat: {
        messages: [],
        status: 'ready',
        clear() {},
        stop() {},
        regenerate: async () => {},
        sendMessage: async (_text, options) => {
          if (options?.body) {
            context = Reflect.get(options.body, 'ctx') as AIChatRequestContext;
          }
        },
      },
    });
    request.current = ai.api.submit('Review the selected quote', {
      mode: 'chat',
      toolName: 'comment',
    });
    if (request.current && context) {
      ai.api.receiveComment(request.current, {
        id: 'proof-comment',
        blockRef: context.refs.blocks[0].ref,
        content: 'selected',
        comment: 'Clarify the selected quote.',
      });
    }
    snapshot();
  };
  const measure = async () => {
    const unit =
      shape === 'paragraphs'
        ? 'Some **bold** text.\n\n'
        : shape === 'single'
          ? 'Some plain text. '
          : shape === 'code'
            ? 'const answer = 42;\n'
            : shape === 'table'
              ? '| one | two |\n'
              : shape === 'math'
                ? 'x + y '
                : shape === 'mdx'
                  ? '<columnGroup>\n  <column width="50%">\n    Some text.\n  </column>\n  <column width="50%">\n    Other text.\n  </column>\n</columnGroup>\n\n'
                  : 'A [reference][id].\n\n';
    const body = unit.repeat(Math.ceil(bytes / unit.length));
    const markdown =
      shape === 'code'
        ? `\`\`\`ts\n${body}\n\`\`\``
        : shape === 'math'
          ? `$$\n${body}\n$$`
          : shape === 'table'
            ? `| A | B |\n| - | - |\n${body}`
            : shape === 'reference'
              ? `${body}\n[id]: https://example.com`
              : body;
    const backgroundNodes = Array.from(
      { length: Math.ceil(background / 100) },
      () => paragraph('Background content. '.repeat(5))
    );
    const samples: Array<{
      preview: number;
      final: number;
      accept: number;
      undo: number;
      redo: number;
    }> = [];
    let result = {};
    const phases: Array<{ model: number; react: number; layout: number }> = [];
    const formal = (action: () => unknown) => {
      const work: Record<string, { count: number; duration: number }> = {};
      const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
      const instrument = new URLSearchParams(window.location.search).has(
        'profile'
      );
      if (instrument) {
        globalThis.__PLITE_REACT_RENDER_PROFILER__ = {
          record(event) {
            const key = `${event.kind}:${event.id ?? ''}`;
            work[key] ??= { count: 0, duration: 0 };
            const entry = work[key];
            entry.count += 1;
            entry.duration += event.duration ?? 0;
          },
        };
      }
      try {
        const startTime = performance.now();
        let model = 0;
        flushSync(() => {
          const startModel = performance.now();
          action();
          model = performance.now() - startModel;
        });
        const endReact = performance.now();
        document.querySelector('main')?.getBoundingClientRect();
        const endLayout = performance.now();
        phases.push({
          ...(instrument ? { work } : {}),
          model,
          react: endReact - startTime - model,
          layout: endLayout - endReact,
        });
        return endLayout - startTime;
      } finally {
        globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
      }
    };
    for (let run = 0; run < 14; run += 1) {
      flushSync(() => {
        ai.api.reset();
        editor.update.value.replace({
          children: [paragraph(''), ...backgroundNodes],
          selection: null,
        });
        editor.update.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
        if (mode === 'edit') {
          const target = editor
            .plugin(MarkdownPlugin)
            .api.deserialize(markdown).children;
          editor.update.value.replace({
            children: [...target, ...backgroundNodes],
          });
          editor.update.selection.setNodes(
            editor.read.children().slice(0, target.length)
          );
        }
        ai.api.show();
      });
      editor.api.dom.focus();
      const before = editor.read.value();
      const id = ai.api.start({
        mode: mode === 'insert' ? 'insert' : 'chat',
        toolName: mode === 'edit' ? 'edit' : 'generate',
      });
      request.current = id;
      flushSync(() => ai.api.receive(id, markdown.slice(0, -chunk)));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      let previewCommits = 0;
      const unsubscribe = editor.subscribeCommit(() => {
        previewCommits += 1;
      });
      const previous = ai.store.get('operation');
      if (!previous) throw new Error('Missing prepared operation');
      const preview = formal(() => ai.api.receive(id, markdown));
      const next = ai.store.get('operation');
      if (!next) throw new Error('Missing received operation');
      const changedNodes = next.preview.filter(
        (node, index) => node !== previous.preview[index]
      ).length;
      const final = formal(() => ai.api.finish(id));
      unsubscribe();
      const unchanged =
        JSON.stringify(before) === JSON.stringify(editor.read.value());
      const history = editor.read.history.undos().length;
      let accepted = false;
      const accept = formal(() => {
        accepted = ai.api.accept();
      });
      const acceptedValue = editor.read.value();
      const acceptBatches = editor.read.history.undos().length - history;
      const undo = formal(() => editor.update.history.undo());
      const undoEqual =
        JSON.stringify(before) === JSON.stringify(editor.read.value());
      const redo = formal(() => editor.update.history.redo());
      const redoEqual =
        JSON.stringify(acceptedValue) === JSON.stringify(editor.read.value());
      samples.push({ preview, final, accept, undo, redo });
      result = {
        unchanged,
        accepted,
        acceptBatches,
        undoEqual,
        redoEqual,
        previewCommits,
        changedNodes,
        error: ai.store.get('operation')?.error ?? next.error,
        actualBytes: markdown.length,
        nodes: acceptedValue.children.length,
        textLength: acceptedValue.children.map(NodeApi.string).join('').length,
      };
      if (!accepted || !unchanged || !undoEqual || !redoEqual) break;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
    const warm = samples.slice(4);
    const p95 = Object.fromEntries(
      ['preview', 'final', 'accept', 'undo', 'redo'].map((action) => [
        action,
        warm
          .map((sample) => sample[action as keyof typeof sample])
          .sort((a, b) => a - b)
          .at(-1),
      ])
    );
    setReport(
      JSON.stringify({
        bytes,
        background,
        chunk,
        mode,
        shape,
        cold: samples[0],
        phases,
        warm,
        p95,
        ...result,
      })
    );
  };
  return (
    <TooltipProvider>
      <main className="mx-auto max-w-5xl p-6">
        <h1>AI streaming proof</h1>
        <label>
          Source
          <textarea
            aria-label="Source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </label>
        <button type="button" onClick={start}>
          Start partial edit
        </button>
        <button type="button" onClick={comment}>
          Preview comment
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (request.current) {
              ai.api.error(
                request.current,
                new Error('The AI request failed. Please retry.')
              );
            }
            snapshot();
          }}
        >
          Fail request
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (request.current) ai.api.receive(request.current, source);
            snapshot();
          }}
        >
          Receive
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (request.current) ai.api.finish(request.current);
            snapshot();
          }}
        >
          Finish
        </button>
        <button
          type="button"
          onClick={() => {
            ai.api.accept();
            snapshot();
          }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => {
            ai.api.discard();
            snapshot();
          }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={() => {
            editor.update.history.undo();
            snapshot();
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            editor.update.history.redo();
            snapshot();
          }}
        >
          Redo
        </button>
        <label>
          Bytes
          <input
            aria-label="Bytes"
            type="number"
            value={bytes}
            onChange={(event) => setBytes(Number(event.target.value))}
          />
        </label>
        <label>
          Background bytes
          <input
            aria-label="Background bytes"
            type="number"
            value={background}
            onChange={(event) => setBackground(Number(event.target.value))}
          />
        </label>
        <label>
          Chunk
          <input
            aria-label="Chunk"
            type="number"
            value={chunk}
            onChange={(event) => setChunk(Number(event.target.value))}
          />
        </label>
        <select
          aria-label="Flow"
          value={mode}
          onChange={(event) => setMode(event.target.value as typeof mode)}
        >
          <option value="insert">Insert</option>
          <option value="edit">Edit</option>
          <option value="dialog">Dialog</option>
        </select>
        <select
          aria-label="Shape"
          value={shape}
          onChange={(event) => setShape(event.target.value)}
        >
          {[
            'paragraphs',
            'single',
            'code',
            'math',
            'table',
            'mdx',
            'reference',
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setReport('Running');
            void measure().catch((error) => setReport(String(error)));
          }}
        >
          Measure
        </button>
        <button
          type="button"
          aria-pressed={constrained}
          onClick={() => setConstrained(!constrained)}
        >
          Constrain editor height
        </button>
        <button
          type="button"
          aria-pressed={showClipboard}
          onClick={() => setShowClipboard(!showClipboard)}
        >
          Show clipboard destination
        </button>
        {showClipboard && (
          <button type="button" onClick={snapshot}>
            Inspect source
          </button>
        )}
        <pre data-ai-proof-report>{report}</pre>
        <React.Profiler
          id="editor"
          onRender={(id, _phase, duration) => {
            globalThis.__PLITE_REACT_RENDER_PROFILER__?.record({
              kind: 'runtime-time',
              id: `react:${id}`,
              duration,
            });
          }}
        >
          <Plate editor={editor}>
            <EditorContainer className={constrained ? 'h-96' : undefined}>
              <Editor />
            </EditorContainer>
          </Plate>
        </React.Profiler>
        {showClipboard && <ClipboardDestination />}
      </main>
    </TooltipProvider>
  );
}
