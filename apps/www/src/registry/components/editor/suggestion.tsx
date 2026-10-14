'use client';

import { AuthoredPlugin } from 'platejs/authored';
import { type EditableSiblingProps, useEditor } from 'platejs/react';
import {
  SuggestionPlugin,
  useActiveSuggestion,
  useSuggestionGroups,
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
  const groups = useSuggestionGroups();
  const { activeId } = useActiveSuggestion();

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
  const selector = (changeId: string) =>
    `${scope} [data-editor-authored-change~="${escapeCssString(changeId)}"]`;
  const rules = groups.map((group) => {
    const selectors = group.changes.map((change) => selector(change.id));
    const color = SUGGESTION_COLORS[group.rank % SUGGESTION_COLORS.length];
    const active = group.changes.some((change) => change.id === activeId)
      ? `${selectors.join(',')}{--suggestion-bg:${
          color.hover
        };--suggestion-fg:${color.active};}`
      : '';

    return `${selectors.join(',')}{${colorDeclarations(color)}}${active}`;
  });

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
  list: 'lists',
  table: 'tables',
};

/** Says why Suggesting refused a change, which then applied nothing. */
function SuggestionRefusals() {
  const editor = useEditor();

  React.useEffect(
    () =>
      editor.plugin(AuthoredPlugin).api.subscribeRefusals((refusal) => {
        const places = refusal.reasons.map(
          (reason) => REFUSED[reason] ?? reason
        );

        toast.error(
          refusal.code === 'veto'
            ? `Suggesting is off in ${new Intl.ListFormat('en').format(
                places
              )} for now. Switch to Editing to change them.`
            : refusal.code === 'generated-values'
              ? 'Suggesting is off in this editor.'
              : 'Suggesting cannot record this change yet. Switch to Editing to make it.',
          { id: 'suggestion-refusal' }
        );
      }),
    [editor]
  );

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
          '[&_[data-editor-node=text][data-editor-authored-change]]:bg-[var(--suggestion-bg,var(--color-emerald-100))] [&_[data-editor-node=text][data-editor-authored-change]]:text-[var(--suggestion-fg,var(--color-emerald-700))] [&_[data-editor-node=text][data-editor-authored-change]:hover]:bg-[var(--suggestion-hover,var(--color-emerald-200))] [&_[data-editor-node=text][data-editor-authored-kind~=insert]]:underline [&_[data-editor-node=text][data-editor-authored-kind~=insert]]:decoration-2 [&_[data-editor-node=text][data-editor-authored-kind~=insert]]:underline-offset-2 [&_[data-editor-node=text][data-editor-authored-kind~=delete]]:line-through',
          '[&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:pointer-events-none [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:absolute [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:inset-y-1 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:-left-7 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:w-0.5 [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:rounded-full [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:bg-[var(--suggestion-fg,var(--color-emerald-700))] [&_[data-editor-node=element][data-editor-authored-change]:not([data-editor-inline])]:after:content-[""]',
          '[&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:-left-8 [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:w-auto [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:bg-transparent [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:font-semibold [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:text-[var(--suggestion-fg,var(--color-emerald-700))] [&_[data-editor-node=element][data-editor-authored-change]:is([data-editor-authored-kind~=split],[data-editor-authored-kind~=join]):not([data-editor-inline])]:after:content-["¶"] [&_[data-editor-node=element][data-editor-authored-change][data-editor-authored-kind~=join]:not([data-editor-inline])]:after:line-through',
        ].join(' '),
      },
    },
    slots: { afterEditable: SuggestionSiblings },
  })),
];
