'use client';

import { AuthoredPlugin } from 'platejs/authored';
import {
  type EditableSiblingProps,
  useEditor,
  useEditorSelector,
} from 'platejs/react';
import { suggestionColorOf } from 'platejs/suggestion';
import {
  SuggestionPlugin,
  useActiveSuggestion,
} from 'platejs/suggestion/react';
import * as React from 'react';
import { toast } from 'sonner';

type SuggestionColor = Readonly<{
  active: string;
  background: string;
  foreground: string;
  hover: string;
}>;

const SUGGESTION_COLORS: readonly SuggestionColor[] = [
  {
    active: 'var(--color-emerald-800)',
    background: 'var(--color-emerald-100)',
    foreground: 'var(--color-emerald-700)',
    hover: 'color-mix(in oklab, var(--color-emerald-200) 80%, transparent)',
  },
  {
    active: 'var(--color-violet-800)',
    background: 'var(--color-violet-100)',
    foreground: 'var(--color-violet-700)',
    hover: 'color-mix(in oklab, var(--color-violet-200) 80%, transparent)',
  },
  {
    active: 'var(--color-sky-800)',
    background: 'var(--color-sky-100)',
    foreground: 'var(--color-sky-700)',
    hover: 'color-mix(in oklab, var(--color-sky-200) 80%, transparent)',
  },
  {
    active: 'var(--color-fuchsia-800)',
    background: 'var(--color-fuchsia-100)',
    foreground: 'var(--color-fuchsia-700)',
    hover: 'color-mix(in oklab, var(--color-fuchsia-200) 80%, transparent)',
  },
  {
    active: 'var(--color-orange-800)',
    background: 'var(--color-orange-100)',
    foreground: 'var(--color-orange-700)',
    hover: 'color-mix(in oklab, var(--color-orange-200) 80%, transparent)',
  },
  {
    active: 'var(--color-cyan-800)',
    background: 'var(--color-cyan-100)',
    foreground: 'var(--color-cyan-700)',
    hover: 'color-mix(in oklab, var(--color-cyan-200) 80%, transparent)',
  },
  {
    active: 'var(--color-rose-800)',
    background: 'var(--color-rose-100)',
    foreground: 'var(--color-rose-700)',
    hover: 'color-mix(in oklab, var(--color-rose-200) 80%, transparent)',
  },
] as const;

const escapeCssString = (value: string) =>
  Array.from(value)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;

      if (character === '"' || character === '\\') return `\\${character}`;
      if (code < 0x20 || code === 0x7f) return `\\${code.toString(16)} `;

      return character;
    })
    .join('');

const colorDeclarations = ({
  active,
  background,
  foreground,
  hover,
}: SuggestionColor) =>
  `--suggestion-active:${active};--suggestion-bg:${background};--suggestion-fg:${foreground};--suggestion-hover:${hover};`;

function SuggestionColorStyles({ editableRef }: EditableSiblingProps) {
  const scopeId = React.useId();
  const { activeId } = useActiveSuggestion();
  // The active change's card, read again after each review commit, so the
  // active rule follows the card through a merge or a new oldest change.
  const activeCard = useEditorSelector((editor) =>
    activeId
      ? (editor.plugin(AuthoredPlugin).read.groupOf(activeId)?.id ?? null)
      : null
  );

  React.useLayoutEffect(() => {
    const root = editableRef.current;
    if (!root) return undefined;

    root.setAttribute('data-editor-suggestion-scope', scopeId);

    return () => {
      if (root.getAttribute('data-editor-suggestion-scope') === scopeId) {
        root.removeAttribute('data-editor-suggestion-scope');
      }
    };
  }, [editableRef, scopeId]);

  const scope = `[data-editor-suggestion-scope="${escapeCssString(scopeId)}"]`;
  // The active rule follows the color rules, so it wins on a highlight that
  // also paints another card, and it shows the active card's own colors.
  const rules = SUGGESTION_COLORS.map(
    (color, slot) =>
      `${scope} [data-editor-authored-color="${slot}"]{${colorDeclarations(color)}}`
  );

  if (activeCard) {
    const color =
      SUGGESTION_COLORS[
        suggestionColorOf(activeCard, SUGGESTION_COLORS.length)
      ];

    rules.push(
      `${scope} [data-editor-authored-groups~="${escapeCssString(
        activeCard
      )}"]{${colorDeclarations(color)}--suggestion-bg:${color.hover};--suggestion-fg:${color.active};}`
    );
  }

  return (
    <style
      data-editor-suggestion-active={activeId ?? undefined}
      data-editor-suggestion-colors=""
    >
      {rules.join('')}
    </style>
  );
}

const REFUSED: Readonly<Record<string, string>> = {
  'code-block': 'code blocks',
  table: 'tables',
};
const refusedPlaces = new Intl.ListFormat('en');

function vetoMessage(reasons: readonly string[]) {
  const places = reasons
    .filter((reason) => reason !== 'list')
    .map((reason) => REFUSED[reason] ?? reason);
  const sentences =
    places.length > 0
      ? [
          `Suggesting is off in ${refusedPlaces.format(places)} for now. Switch to Editing to change them.`,
        ]
      : [];

  if (reasons.includes('list')) {
    sentences.push(
      "Suggesting can't change list items yet, only the text in them."
    );
  }

  return sentences.join(' ');
}

function SuggestionRefusals() {
  const editor = useEditor();

  React.useEffect(() => {
    const authored = editor.plugin(AuthoredPlugin);

    return authored.api.subscribeRefusals((refusal) => {
      const view = authored.read.view();
      // A reason names content a pending join moves, which Editing refuses
      // too, so a Suggesting writer reads why instead of a hint to switch.
      const unrecorded =
        'intent' in view && view.intent === 'edit'
          ? 'Editing cannot record this change next to a pending suggestion yet. Accept or reject that suggestion first.'
          : refusal.reasons.length > 0
            ? refusal.message
            : 'Suggesting cannot record this change yet. Switch to Editing to make it.';

      toast.error(
        refusal.code === 'veto'
          ? vetoMessage(refusal.reasons)
          : refusal.code === 'generated-values'
            ? 'Suggesting is off in this editor.'
            : unrecorded,
        { id: 'suggestion-refusal' }
      );
    });
  }, [editor]);

  return null;
}

function SuggestionSiblings(props: EditableSiblingProps) {
  return (
    <>
      <SuggestionColorStyles {...props} />
      <SuggestionRefusals />
    </>
  );
}

export const SuggestionKit = [
  SuggestionPlugin.configure(() => ({
    render: {
      contentAttributes: {
        // A block's own mark, such as a split, a join or a format change,
        // may leave its text unmarked, so the block gets a gutter marker:
        // a pilcrow at a suggested line break, a bar otherwise.
        className: [
          '[&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-change]]:bg-[var(--suggestion-bg,var(--color-emerald-100))] [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-change]]:text-[var(--suggestion-fg,var(--color-emerald-700))] [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-change]:hover]:bg-[var(--suggestion-hover,var(--color-emerald-200))] [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=insert]]:underline [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=insert]]:decoration-2 [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=insert]]:underline-offset-2 [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=delete]]:line-through',
          '[&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:pointer-events-none [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:absolute [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:inset-y-1 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:-left-7 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:w-0.5 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:rounded-full [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:bg-[var(--suggestion-fg,var(--color-emerald-700))] [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:content-[""]',
          '[&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:-left-8 [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:w-auto [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:bg-transparent [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:font-semibold [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:text-[var(--suggestion-fg,var(--color-emerald-700))] [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:content-["¶"] [&_[data-editor-node=element][data-editor-authored-change][data-editor-authored-kind~=join]:not([data-editor-inline])]:after:line-through',
        ].join(' '),
      },
    },
    slots: { afterEditable: SuggestionSiblings },
  })),
];
