'use client';

import { useSearchParams } from 'next/navigation';
import {
  FootnoteDefinitionPlugin,
  FootnotePlugin,
} from 'platejs/footnote/react';
import { MentionPlugin } from 'platejs/mention/react';
import {
  BoldPlugin,
  EditorContent,
  EditorRoot,
  createEditor,
} from 'platejs/react';
import { SlashPlugin } from 'platejs/slash-command/react';
import {
  Editable,
  EditorRoot as PliteEditorRoot,
  createEditor as createPliteEditor,
} from 'plitejs/react';
import React, { Suspense } from 'react';

import { EmojiKit, EmojiPlugin } from '@/registry/components/editor/emoji';
import {
  FootnoteDefinitionElement,
  FootnoteKit,
  FootnoteReferenceElement,
} from '@/registry/components/editor/footnote';
import {
  MentionElement,
  MentionKit,
} from '@/registry/components/editor/mention';
import { SlashKit } from '@/registry/components/editor/slash';

const KitsWithoutPopups = [
  MentionPlugin.configure({ component: MentionElement }),
  SlashPlugin,
  EmojiPlugin,
  FootnotePlugin.configure({ component: FootnoteReferenceElement }),
  FootnoteDefinitionPlugin.configure({ component: FootnoteDefinitionElement }),
];

type ProbeWindow = Window & {
  __comboboxTypingSamples?: number[];
  __typedTextReports?: number | null;
};

const markedParagraph = (chars: number, run: number) => {
  const children: Array<{ bold?: true; text: string }> = [];

  for (let start = 0; start < chars; start += run) {
    const text = 'x'.repeat(Math.min(run, chars - start));

    children.push(children.length % 2 ? { bold: true, text } : { text });
  }

  return { children, type: 'paragraph' };
};

// Definitions go first so the document end stays the typed paragraph's end.
const probeValue = (chars: number, run: number, defs: number) => [
  ...Array.from({ length: defs }, (_, index) => ({
    children: [
      { children: [{ text: `Definition ${index + 1}` }], type: 'paragraph' },
    ],
    ref: String(index + 1),
    type: 'footnoteDefinition',
  })),
  markedParagraph(chars, run),
];

const usePaintSamples = () => {
  React.useEffect(() => {
    const probe = window as ProbeWindow;
    const samples: number[] = [];

    probe.__comboboxTypingSamples = samples;

    const onBeforeInput = (event: Event) => {
      const start = event.timeStamp;

      requestAnimationFrame(() => {
        setTimeout(() => {
          samples.push(performance.now() - start);
        }, 0);
      });
    };

    window.addEventListener('beforeinput', onBeforeInput, { capture: true });

    return () => {
      window.removeEventListener('beforeinput', onBeforeInput, {
        capture: true,
      });
    };
  }, []);
};

// The baseline build predates subscribeTypedText, so the report count stays
// null there.
function PliteTypingProbe({ chars, run }: { chars: number; run: number }) {
  const [editor] = React.useState(() =>
    createPliteEditor({ initialValue: [markedParagraph(chars, run)] })
  );

  usePaintSamples();
  React.useEffect(() => {
    const probe = window as ProbeWindow;
    const { subscribeTypedText } = editor.api.react as {
      subscribeTypedText?: (listener: () => void) => () => void;
    };

    probe.__typedTextReports = subscribeTypedText ? 0 : null;

    return subscribeTypedText?.(() => {
      probe.__typedTextReports = (probe.__typedTextReports ?? 0) + 1;
    });
  }, [editor]);

  return (
    <main className="p-8" data-probe-engine="plite">
      <PliteEditorRoot editor={editor}>
        <Editable className="max-w-3xl outline-none" />
      </PliteEditorRoot>
    </main>
  );
}

function ComboboxTypingProbe() {
  const params = useSearchParams();
  const chars = Number(params?.get('chars') ?? 2000);
  const run = Number(params?.get('run') ?? 10);

  return params?.get('engine') === 'plite' ? (
    <PliteTypingProbe chars={chars} run={run} />
  ) : (
    <PlateTypingProbe
      chars={chars}
      defs={Number(params?.get('defs') ?? 0)}
      kits={params?.get('kits') === 'on'}
      popups={params?.get('popups') !== 'off'}
      run={run}
    />
  );
}

function PlateTypingProbe({
  chars,
  defs,
  kits,
  popups,
  run,
}: {
  chars: number;
  defs: number;
  kits: boolean;
  popups: boolean;
  run: number;
}) {
  const [editor] = React.useState(() =>
    createEditor({
      initialValue: probeValue(chars, run, defs),
      plugins: [
        BoldPlugin,
        ...(kits && popups
          ? [...MentionKit, ...SlashKit, ...EmojiKit, ...FootnoteKit]
          : []),
        ...(kits && !popups ? KitsWithoutPopups : []),
      ],
    })
  );

  usePaintSamples();

  return (
    <main
      className="p-8"
      data-probe-kits={kits ? 'on' : 'off'}
      data-probe-popups={popups ? 'on' : 'off'}
    >
      <EditorRoot editor={editor}>
        <EditorContent className="max-w-3xl outline-none" />
      </EditorRoot>
    </main>
  );
}

export default function ComboboxTypingPage() {
  return (
    <Suspense fallback={<p>Loading typing probe…</p>}>
      <ComboboxTypingProbe />
    </Suspense>
  );
}
