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
import React, { Suspense } from 'react';

import { EmojiKit, emojiPlugin } from '@/registry/components/editor/emoji';
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
  emojiPlugin,
  FootnotePlugin.configure({ component: FootnoteReferenceElement }),
  FootnoteDefinitionPlugin.configure({ component: FootnoteDefinitionElement }),
];

type ProbeWindow = Window & { __comboboxTypingSamples?: number[] };

const markedParagraph = (chars: number, run: number) => {
  const children: Array<{ bold?: true; text: string }> = [];

  for (let start = 0; start < chars; start += run) {
    const text = 'x'.repeat(Math.min(run, chars - start));

    children.push(children.length % 2 ? { bold: true, text } : { text });
  }

  return [{ children, type: 'paragraph' }];
};

function ComboboxTypingProbe() {
  const params = useSearchParams();
  const kits = params?.get('kits') === 'on';
  const popups = params?.get('popups') !== 'off';
  const chars = Number(params?.get('chars') ?? 2000);
  const run = Number(params?.get('run') ?? 10);
  const [editor] = React.useState(() =>
    createEditor({
      initialValue: markedParagraph(chars, run),
      plugins: [
        BoldPlugin,
        ...(kits && popups
          ? [...MentionKit, ...SlashKit, ...EmojiKit, ...FootnoteKit]
          : []),
        ...(kits && !popups ? KitsWithoutPopups : []),
      ],
    })
  );

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
