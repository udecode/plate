'use client';

import type { EditableSiblingProps } from 'platejs/react';
import { useEditor } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import * as React from 'react';

type SuggestionColor = Readonly<{
  active: string;
  background: string;
  foreground: string;
  hover: string;
}>;

const OWN_COLOR: SuggestionColor = {
  active: 'var(--color-emerald-800)',
  background: 'var(--color-emerald-100)',
  foreground: 'var(--color-emerald-700)',
  hover: 'color-mix(in oklab, var(--color-emerald-200) 80%, transparent)',
};

const COLLABORATOR_COLORS: readonly SuggestionColor[] = [
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

const hashAuthor = (authorId: string) => {
  let hash = 2_166_136_261;

  for (const character of authorId) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
};

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
  const editor = useEditor();
  const currentUserId = editor.runtime.userId ?? '';
  const scopeId = React.useId();
  const colors = React.useRef(new Map<string, SuggestionColor>());
  const collaboratorSlots = React.useRef(new Map<string, number>());
  const styleRef = React.useRef<HTMLStyleElement>(null);
  const registerAuthors = React.useCallback(
    (nextAuthorIds: Iterable<string>) => {
      const rules: string[] = [];
      const scope = `[data-editor-suggestion-scope="${escapeCssString(
        scopeId
      )}"]`;
      const usedSlots = new Set(collaboratorSlots.current.values());

      for (const authorId of nextAuthorIds) {
        if (!authorId || colors.current.has(authorId)) continue;

        let color = OWN_COLOR;

        if (authorId !== currentUserId) {
          let slot = hashAuthor(authorId) % COLLABORATOR_COLORS.length;

          for (let offset = 0; offset < COLLABORATOR_COLORS.length; offset++) {
            const candidate = (slot + offset) % COLLABORATOR_COLORS.length;

            if (!usedSlots.has(candidate)) {
              slot = candidate;
              break;
            }
          }
          usedSlots.add(slot);
          collaboratorSlots.current.set(authorId, slot);
          color = COLLABORATOR_COLORS[slot];
        }

        colors.current.set(authorId, color);
        const author = `[data-editor-authored-author="${escapeCssString(
          authorId
        )}"]`;

        rules.push(
          `${scope} ${author},${scope} .editor-inline-suggestion:has(${author}){${colorDeclarations(color)}}`
        );
      }

      if (rules.length > 0 && styleRef.current) {
        styleRef.current.textContent += rules.join('');
      }
    },
    [currentUserId, scopeId]
  );

  React.useLayoutEffect(() => {
    const root = editableRef.current;
    if (!root) return undefined;

    colors.current.clear();
    collaboratorSlots.current.clear();
    if (styleRef.current) styleRef.current.textContent = '';
    root.setAttribute('data-editor-suggestion-scope', scopeId);

    const collect = (target: ParentNode, authors: Set<string>) => {
      if (
        target instanceof HTMLElement &&
        target.hasAttribute('data-editor-authored-author')
      ) {
        authors.add(target.getAttribute('data-editor-authored-author') ?? '');
      }
      target
        .querySelectorAll<HTMLElement>('[data-editor-authored-author]')
        .forEach((element) =>
          authors.add(element.getAttribute('data-editor-authored-author') ?? '')
        );
    };

    const initialAuthors = new Set<string>();
    collect(root, initialAuthors);
    registerAuthors(initialAuthors);
    const observer = new MutationObserver((records) => {
      const authors = new Set<string>();

      for (const record of records) {
        if (record.type === 'attributes') {
          collect(record.target as HTMLElement, authors);
          continue;
        }
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) collect(node, authors);
        });
      }
      registerAuthors(authors);
    });

    observer.observe(root, {
      attributeFilter: ['data-editor-authored-author'],
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (root.getAttribute('data-editor-suggestion-scope') === scopeId) {
        root.removeAttribute('data-editor-suggestion-scope');
      }
    };
  }, [editableRef, registerAuthors, scopeId]);

  return <style ref={styleRef} data-editor-suggestion-colors="" />;
}

export const SuggestionKit = [
  SuggestionPlugin.configure(() => ({
    render: {
      contentAttributes: {
        className:
          '[&_[data-editor-authored-change]]:bg-[var(--suggestion-bg,var(--color-emerald-100))] [&_[data-editor-authored-change]]:text-[var(--suggestion-fg,var(--color-emerald-700))] [&_:is([data-editor-authored-kind=insert],[data-editor-authored-kind=mixed]):not([data-editor-retained=delete])]:underline [&_:is([data-editor-authored-kind=insert],[data-editor-authored-kind=mixed]):not([data-editor-retained=delete])]:decoration-2 [&_:is([data-editor-authored-kind=insert],[data-editor-authored-kind=mixed]):not([data-editor-retained=delete])]:underline-offset-2 [&_[data-editor-authored-change]:hover]:bg-[var(--suggestion-hover,var(--color-emerald-200))] [&_[data-editor-authored-change][data-editor-authored-status=conflicted]]:bg-amber-100 [&_[data-editor-authored-change][data-editor-authored-status=conflicted]]:text-amber-800 [&_[data-editor-authored-change][data-editor-authored-status=conflicted]:hover]:bg-amber-200/80 [&_[data-editor-authored-status=conflicted][data-editor-suggestion-active]]:bg-amber-200/80 [&_[data-editor-authored-status=conflicted][data-editor-suggestion-active]]:text-amber-900 [&_[data-editor-retained=delete]]:line-through [&_[data-editor-suggestion-active]]:bg-[var(--suggestion-hover,var(--color-emerald-200))] [&_[data-editor-suggestion-active]]:text-[var(--suggestion-active,var(--color-emerald-800))]',
      },
    },
    slots: { afterEditable: SuggestionColorStyles },
  })),
];
