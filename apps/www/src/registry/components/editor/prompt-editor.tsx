'use client';

import { useComboboxContext, useStoreState } from '@ariakit/react';
import { cn } from 'cn';
import {
  ContentSlice,
  type Descendant,
  editorCommands,
  ElementApi,
  NodeApi,
  txLocate,
} from 'platejs';
import { MentionPlugin } from 'platejs/mention/react';
import {
  definePlugin,
  type EditableSiblingProps,
  EditorContent,
  EditorRoot,
  useCreateEditor,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';
// oxlint-disable-next-line react-doctor/no-flush-sync -- Enter presses Send in the same keydown, so a form that reads its own state must have rendered the text first.
import { flushSync } from 'react-dom';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxItem,
} from './inline-combobox';
import { MentionElement } from './mention';

type PromptEditorItem = { label: string; ref: string };

const RECEIVE = 'prompt-editor-receive';

const MENTION_TAG =
  /<mention ref="([^"<>]*[^"<>\s][^"<>]*)">([^<>]*)<\/mention>/g;

const escapeText = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const unescapeText = (text: string) =>
  text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');

const isMention = (
  node: Descendant,
  mentionType: string
): node is Descendant & { ref: string; label?: string } =>
  ElementApi.isElementType(node, mentionType) && typeof node.ref === 'string';

const toMessage = (children: readonly Descendant[], mentionType: string) =>
  children
    .map((block) =>
      ElementApi.isElement(block)
        ? block.children
            .map((node) =>
              isMention(node, mentionType)
                ? `<mention ref="${escapeText(node.ref).replaceAll('"', '&quot;')}">${escapeText(node.label ?? node.ref)}</mention>`
                : NodeApi.string(node)
            )
            .join('')
        : ''
    )
    .join('\n');

const toValue = (message: string, mentionType: string) =>
  message.split('\n').map((line) => {
    const children: Descendant[] = [];
    let end = 0;

    for (const tag of line.matchAll(MENTION_TAG)) {
      children.push(
        { text: line.slice(end, tag.index) },
        {
          children: [{ text: '' }],
          label: unescapeText(tag[2]),
          ref: unescapeText(tag[1]),
          type: mentionType,
        }
      );
      end = tag.index + tag[0].length;
    }

    children.push({ text: line.slice(end) });

    return { children, type: 'paragraph' };
  });

const menuShowsMatch = (root: HTMLElement) => {
  const listbox = root.getAttribute('aria-controls');

  return (
    !!listbox &&
    !!root.ownerDocument
      .getElementById(listbox)
      ?.querySelector('[role="option"]')
  );
};

const PromptEditorPlugin = definePlugin('promptEditor', {
  initialState: (): {
    items: readonly PromptEditorItem[];
    report: () => void;
  } => ({ items: [], report: () => {} }),
}).extend(({ editor, store }) => ({
  commands: ({ around }) => [
    // A chip pasted from another document keeps its id only when this field
    // offers the same item, because the id may name something else here.
    around(editorCommands.replaceSlice, ({ input, next }) => {
      const { items } = store.get();
      const mentionType = editor.plugin(MentionPlugin).schema.type;
      const keepKnownChips = (nodes: readonly Descendant[]): Descendant[] =>
        nodes.map((node) => {
          if (!ElementApi.isElement(node)) return node;
          if (!isMention(node, mentionType)) {
            return { ...node, children: keepKnownChips(node.children) };
          }

          const label = node.label ?? node.ref;

          return items.some(
            (item) => item.ref === node.ref && item.label === label
          )
            ? node
            : { text: label };
        });

      return next({
        ...input,
        slice: ContentSlice.withContent(
          input.slice,
          keepKnownChips(input.slice.content),
          { open: 'preserve' }
        ),
      });
    }),
  ],
  shortcuts: {
    send: {
      keys: 'alt?+ctrl?+meta?+enter',
      handler: () => {
        const root = editor.api.dom.root();
        const form = root?.closest('form');

        if (!root || menuShowsMatch(root) || !form) return;

        flushSync(store.get().report);

        const send = Array.from(form.elements).find(
          (control): control is HTMLButtonElement | HTMLInputElement =>
            (control instanceof HTMLButtonElement ||
              control instanceof HTMLInputElement) &&
            control.type === 'submit'
        );

        if (send && !send.disabled) send.click();
      },
    },
  },
  update: ({ tx }) => ({
    setMessage: txLocate(false, (message: string) => {
      const hadSelection = tx.selection() !== null;

      tx.value.replace({
        children: toValue(message, editor.plugin(MentionPlugin).schema.type),
      });

      const end = tx.points.end([]);

      if (hadSelection && end) tx.selection.set(end);
    }),
  }),
}));

const rankItem = (item: PromptEditorItem, search: string) => {
  const label = item.label.toLowerCase();
  const ref = item.ref.toLowerCase();

  if (label === search || ref === search) return 0;
  if (label.startsWith(search)) return 1;
  if (label.includes(search)) return 2;
  if (ref.includes(search)) return 3;

  return null;
};

function PromptEditorCombobox({ editableRef }: EditableSiblingProps) {
  return (
    <InlineCombobox editableRef={editableRef} plugin={MentionPlugin}>
      <PromptEditorOptions />
    </InlineCombobox>
  );
}

function PromptEditorOptions() {
  const items = usePluginStore(PromptEditorPlugin, 'items');
  const search = (useStoreState(useComboboxContext(), 'value') ?? '')
    .trim()
    .toLowerCase();
  const options = React.useMemo(
    () =>
      items
        .flatMap((item) => {
          const rank = rankItem(item, search);

          return rank === null ? [] : [{ item, rank }];
        })
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 50),
    [items, search]
  );

  return (
    <InlineComboboxContent className="my-1.5">
      <InlineComboboxEmpty>No results</InlineComboboxEmpty>

      {options.map(({ item }) => (
        <InlineComboboxItem
          key={item.ref}
          className="h-auto flex-col items-start gap-0 py-1"
          onSelect={(tx) => {
            tx.plugin(MentionPlugin).insert({
              label: item.label,
              ref: item.ref,
            });
          }}
        >
          {item.label}
          <span className="text-xs text-muted-foreground">{item.ref}</span>
        </InlineComboboxItem>
      ))}
    </InlineComboboxContent>
  );
}

/**
 * A message field for a chat form: a text area that also holds chips. Enter
 * presses the form's Send button, and the message is the typed text with each
 * chip as `<mention ref="…">label</mention>`.
 */
export function PromptEditor({
  className,
  disabled,
  items,
  name,
  placeholder,
  ref,
  value,
  onChange,
  onFiles,
}: {
  className?: string;
  disabled?: boolean;
  /** What the @ menu offers. Without items, a typed @ stays text. */
  items?: readonly PromptEditorItem[];
  /** The key the message takes in the form's `FormData`. */
  name?: string;
  placeholder?: string;
  ref?: React.Ref<{ focus: () => void }>;
  /** The message. A value other than the last one reported replaces the text. */
  value?: string;
  /** Called with the message after each change, and before Enter sends. */
  onChange?: (message: string) => void;
  /** Called with the files of a paste or a drop, which never enter the text. */
  onFiles?: (files: File[]) => void;
}) {
  const editor = useCreateEditor(
    {
      plugins: [
        MentionPlugin.configure({
          component: MentionElement,
          initialState: {
            insertSpaceAfterMention: true,
            triggerPreviousCharPattern: /^$|^[\s"']$/,
            triggerQuery: (current) =>
              current.plugin(PromptEditorPlugin).store.get().items.length > 0,
          },
          slots: { afterEditable: PromptEditorCombobox },
        }),
        PromptEditorPlugin,
      ],
      initialValue: ({ editor: created }) =>
        toValue(value ?? '', created.plugin(MentionPlugin).schema.type),
    },
    []
  );
  const prompt = editor.plugin(PromptEditorPlugin);
  const mentionType = editor.plugin(MentionPlugin).schema.type;
  const reported = React.useRef(value ?? '');
  // A parent that turns a change down keeps the same `value`, so React would
  // not render the field again to put that value back.
  const [, renderAgain] = React.useReducer((count: number) => count + 1, 0);
  const report = () => {
    const message = toMessage(editor.read.children(), mentionType);

    reported.current = message;
    onChange?.(message);
    if (value !== undefined) renderAgain();
  };

  React.useImperativeHandle(
    ref,
    () => ({ focus: () => editor.api.dom.focus() }),
    [editor]
  );

  React.useLayoutEffect(() => {
    prompt.store.set({ items: items ?? [], report });

    if (value === undefined || value === reported.current) return;

    reported.current = value;
    prompt.update({ history: 'skip', tags: RECEIVE }).setMessage(value);
  });

  React.useEffect(() => {
    const form = editor.api.dom.root()?.closest('form');

    if (!form) return undefined;

    const view = form.ownerDocument.defaultView;
    const onFormData = (event: FormDataEvent) => {
      if (name) {
        event.formData.set(
          name,
          toMessage(editor.read.children(), mentionType)
        );
      }
    };
    // The window hears a reset after every listener that can cancel it,
    // React's `onReset` included.
    const onReset = (event: Event) => {
      if (event.target !== form || event.defaultPrevented) return;

      prompt.update({ history: 'skip' }).setMessage('');
    };
    const onSubmit = () => {
      editor.api.react.settleInput();
      flushSync(prompt.store.get().report);
    };

    form.addEventListener('formdata', onFormData);
    form.addEventListener('submit', onSubmit, true);
    view?.addEventListener('reset', onReset);

    return () => {
      form.removeEventListener('formdata', onFormData);
      form.removeEventListener('submit', onSubmit, true);
      view?.removeEventListener('reset', onReset);
    };
  }, [editor, mentionType, name, prompt]);

  return (
    <EditorRoot
      editor={editor}
      onValueChange={({ commit }) => {
        if (!commit.tags.includes(RECEIVE)) report();
      }}
    >
      <EditorContent
        className={cn(
          'min-h-16 w-full min-w-0 flex-1 cursor-text px-3 py-3 text-base outline-none md:text-sm',
          'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          '**:data-editor-placeholder:text-muted-foreground **:data-editor-placeholder:opacity-100!',
          className
        )}
        data-slot="input-group-control"
        disabled={disabled}
        placeholder={placeholder}
        onDragOver={(event) => {
          if (disabled || !event.dataTransfer.types.includes('Files')) {
            return undefined;
          }

          event.preventDefault();

          return true;
        }}
        onDrop={(event) => {
          const files = Array.from(event.dataTransfer.files);

          if (files.length === 0) return undefined;
          if (!disabled && !event.defaultPrevented) {
            event.preventDefault();
            // A host's document drop listener would add the files again.
            event.stopPropagation();
            onFiles?.(files);
          }

          return true;
        }}
        onPaste={(event) => {
          const files = Array.from(event.clipboardData.files);

          if (files.length === 0) return undefined;

          event.preventDefault();
          if (!disabled) onFiles?.(files);

          return true;
        }}
      />
    </EditorRoot>
  );
}
