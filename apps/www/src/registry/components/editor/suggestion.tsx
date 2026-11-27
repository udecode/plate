'use client';

import { AuthoredPlugin } from 'platejs/authored';
import {
  type EditableSiblingProps,
  useEditor,
  useEditorSelector,
} from 'platejs/react';
import { SUGGESTION_COLOR_COUNT, suggestionColorOf } from 'platejs/suggestion';
import {
  SuggestionPlugin,
  useActiveSuggestion,
} from 'platejs/suggestion/react';
import * as React from 'react';
import { toast } from 'sonner';

const escapeCssString = (value: string) =>
  Array.from(value)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;

      if (character === '"' || character === '\\') return `\\${character}`;
      if (code < 0x20 || code === 0x7f) return `\\${code.toString(16)} `;

      return character;
    })
    .join('');

const slotColor = (slot: number) => `var(--editor-suggestion-${slot + 1})`;

const tint = (color: string, percent: number) =>
  `color-mix(in oklab, ${color} ${percent}%, var(--background))`;

const restingDeclarations = (slot: number) => {
  const color = slotColor(slot);

  return `--suggestion-bg:${tint(color, 14)};--suggestion-fg:${color};--suggestion-hover:${tint(color, 22)};`;
};

const activeDeclarations = (slot: number) => {
  const color = slotColor(slot);
  const hover = tint(color, 22);

  return `--suggestion-bg:${hover};--suggestion-fg:color-mix(in oklab, ${color} 72%, var(--foreground));--suggestion-hover:${hover};`;
};

function SuggestionColorStyles({ editableRef }: EditableSiblingProps) {
  const scopeId = React.useId();
  const { activeId } = useActiveSuggestion();
  // The active change's card, read again after each review commit, so the
  // active rule follows the card through a merge or a new oldest change.
  const activeCard = useEditorSelector((editor) => {
    const card = activeId
      ? editor.plugin(AuthoredPlugin).read.groupOf(activeId)
      : null;

    return card ? { authorId: card.authorId, id: card.id } : null;
  });

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
  const rules = [
    `${scope} :where([data-editor-authored-change]){${restingDeclarations(0)}}`,
    ...Array.from(
      { length: SUGGESTION_COLOR_COUNT },
      (_, slot) =>
        `${scope} [data-editor-authored-color="${slot}"]{${restingDeclarations(slot)}}`
    ),
    activeCard
      ? `${scope} [data-editor-authored-change][data-editor-authored-groups~="${escapeCssString(
          activeCard.id
        )}"]{${activeDeclarations(suggestionColorOf(activeCard.authorId))}}`
      : '',
  ];

  return (
    <style
      data-editor-suggestion-active={activeId ?? undefined}
      data-editor-suggestion-colors=""
    >
      {rules.join('')}
    </style>
  );
}

const REFUSED = new Map([
  [
    'code-block',
    "Suggesting can't change a code block yet, or a table that holds one. Switch to Editing to change them.",
  ],
  [
    'table',
    "Suggesting can add or delete a whole table, but can't yet change its rows, columns, cells or sizes, or add or delete a block that holds a table. Switch to Editing to make those changes.",
  ],
]);
const refusedPlaces = new Intl.ListFormat('en');

function vetoMessage(reasons: readonly string[]) {
  const places = reasons.filter((reason) => !REFUSED.has(reason));
  const sentences =
    places.length > 0
      ? [
          `Suggesting is off in ${refusedPlaces.format(places)} for now. Switch to Editing to change them.`,
        ]
      : [];

  return [
    ...sentences,
    ...reasons.flatMap((reason) => REFUSED.get(reason) ?? []),
  ].join(' ');
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

const SUGGESTED_TEXT =
  '[&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-change]]:bg-[var(--suggestion-bg,color-mix(in_oklab,var(--editor-suggestion-1)_14%,var(--background)))] [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-change]]:text-[var(--suggestion-fg,var(--editor-suggestion-1))] [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-change]:hover]:bg-[var(--suggestion-hover,color-mix(in_oklab,var(--editor-suggestion-1)_22%,var(--background)))] [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=insert]]:underline [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=insert]]:decoration-2 [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=insert]]:underline-offset-2 [&_:is([data-editor-node=text],[data-editor-text-piece])[data-editor-authored-kind~=delete]]:line-through';
const CHANGED_BLOCK_BAR =
  '[&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:pointer-events-none [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:absolute [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:inset-y-1 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:-start-7 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:w-0.5 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:rounded-full [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:bg-[var(--suggestion-fg,var(--editor-suggestion-1))] [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:content-[""]';
const LINE_BREAK_PILCROW =
  '[&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:-start-8 [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:w-auto [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:bg-transparent [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:font-semibold [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:text-[var(--suggestion-fg,var(--editor-suggestion-1))] [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:content-["¶"] [&_[data-editor-node=element][data-editor-authored-change][data-editor-authored-kind~=join]:not([data-editor-inline])]:after:line-through';
const WHOLE_TABLE_TINT =
  '[&_:is(td,th):is([data-editor-authored-kind~=insert],[data-editor-authored-kind~=delete])]:bg-[var(--suggestion-bg,color-mix(in_oklab,var(--editor-suggestion-1)_14%,var(--background)))] [&_:is(tr,td,th)[data-editor-node=element]:is([data-editor-authored-kind~=insert],[data-editor-authored-kind~=delete]):not([data-editor-inline],[data-editor-authored-kind~=format])]:after:content-none [&_:is(td,th):is([data-editor-authored-kind~=insert],[data-editor-authored-kind~=delete])_[data-editor-node=element][data-editor-authored-change]:not([data-editor-authored-kind~=split],[data-editor-authored-kind~=join],[data-editor-authored-kind~=format])]:after:content-none';

export const SuggestionKit = [
  SuggestionPlugin.configure(() => ({
    render: {
      contentAttributes: {
        className: [
          SUGGESTED_TEXT,
          CHANGED_BLOCK_BAR,
          LINE_BREAK_PILCROW,
          WHOLE_TABLE_TINT,
        ].join(' '),
      },
    },
    slots: { afterEditable: SuggestionSiblings },
  })),
];
