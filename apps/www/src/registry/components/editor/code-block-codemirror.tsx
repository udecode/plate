'use client';

import {
  indentLess,
  indentMore,
  insertNewlineAndIndent,
} from '@codemirror/commands';
import {
  HighlightStyle,
  indentUnit,
  LanguageDescription,
  syntaxHighlighting,
} from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { search, searchKeymap } from '@codemirror/search';
// oxlint-disable-next-line react-doctor/prefer-dynamic-import -- This opt-in component is the loading boundary; extensions must exist when its adapter mounts.
import { EditorState } from '@codemirror/state';
// oxlint-disable-next-line react-doctor/prefer-dynamic-import -- This opt-in component is the loading boundary; extensions must exist when its adapter mounts.
import { EditorView, keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { createCodeMirrorAdapter } from 'platejs/code-block/codemirror';
import type { CodeBlockPlugin, PlateElementProps } from 'platejs/react';

import { CodeBlockContainer } from '@/registry/components/editor/code-block';

const syntaxColors = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.keyword, class: 'hljs-keyword' },
    { tag: [tags.string, tags.regexp], class: 'hljs-string' },
    { tag: [tags.number, tags.bool, tags.null], class: 'hljs-number' },
    { tag: tags.comment, class: 'hljs-comment' },
    { tag: tags.function(tags.variableName), class: 'hljs-title function_' },
    { tag: [tags.typeName, tags.className], class: 'hljs-type' },
    { tag: tags.propertyName, class: 'hljs-attr' },
  ])
);
const languageDescription = (name?: string) =>
  name ? LanguageDescription.matchLanguageName(languages, name, false) : null;

const codeMirrorLanguages = [
  { label: 'Plain Text', value: 'plaintext' },
  ...languages.map(({ name }) => ({ label: name, value: name.toLowerCase() })),
];

const codeMirrorAdapter = createCodeMirrorAdapter({
  extensions: [
    syntaxColors,
    indentUnit.of('  '),
    EditorState.tabSize.of(2),
    search({ top: true }),
    keymap.of(searchKeymap),
    EditorView.domEventHandlers({
      keydown(event, view) {
        if (
          event.isComposing ||
          view.compositionStarted ||
          view.state.readOnly
        ) {
          return false;
        }
        if (event.metaKey || event.ctrlKey || event.altKey) return false;
        if (event.key === 'Tab') {
          return (event.shiftKey ? indentLess : indentMore)(view);
        }
        if (event.key === 'Enter' && !event.shiftKey) {
          return insertNewlineAndIndent(view);
        }

        return false;
      },
    }),
    EditorView.theme({
      '&': {
        backgroundColor: 'transparent',
        color: 'inherit',
      },
      '&.cm-focused': { outline: 'none' },
      '.cm-content': {
        caretColor: 'currentColor',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.875rem',
        lineHeight: 'normal',
        padding: '2rem 1rem 2rem 2rem',
      },
      '.cm-scroller': {
        maxHeight: 'min(70vh, 48rem)',
        overflow: 'auto',
      },
      '[data-code-block-model-selection]': {
        backgroundColor: 'color-mix(in srgb, var(--brand) 25%, transparent)',
      },
      '.cm-search': {
        alignItems: 'center',
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.25rem',
        padding: '0.375rem',
      },
      '.cm-search input': {
        backgroundColor: 'var(--background)',
        border: '1px solid var(--input)',
        borderRadius: '0.375rem',
        color: 'inherit',
        padding: '0.25rem 0.5rem',
      },
      '.cm-search button': {
        border: '1px solid var(--border)',
        borderRadius: '0.375rem',
        padding: '0.25rem 0.5rem',
      },
      '@media print': {
        '.cm-scroller': {
          maxHeight: 'none',
          overflow: 'visible',
        },
      },
    }),
  ],
  loadLanguage(name) {
    const description = languageDescription(name);

    return description?.support ?? description?.load() ?? [];
  },
});

export function CodeBlockCodeMirrorElement(
  props: PlateElementProps<typeof CodeBlockPlugin> & {
    showLanguageLabel?: boolean;
  }
) {
  return (
    <CodeBlockContainer
      elementProps={props}
      languageOptions={codeMirrorLanguages}
      showLanguageLabel={props.showLanguageLabel ?? true}
    >
      {props.slots.externalText({
        adapter: codeMirrorAdapter,
        ariaLabel: 'Code block',
        config: { language: props.element.language },
      })}
    </CodeBlockContainer>
  );
}
