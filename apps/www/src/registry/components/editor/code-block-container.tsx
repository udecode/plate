'use client';

import { cn } from 'cn';
import { DiffMatchPatch, DiffOp } from 'diff-match-patch-ts';
import { BracesIcon, Check, CheckIcon, CopyIcon } from 'lucide-react';
import { CodeBlockRules, type Element, ElementApi, NodeApi } from 'platejs';
import {
  CodeBlockPlugin,
  type Editor,
  EditorElement,
  type EditorElementProps,
  useEditor,
  useEditorReadOnly,
  useElement,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  type CodeBlockLanguageOption,
  codeBlockLanguages,
  codeSyntaxClassName,
  findCodeBlockLanguage,
  getCodeBlockLanguageLabel,
  matchesCodeBlockLanguageQuery,
  resolveCodeBlockLanguage,
} from '@/registry/components/editor/code-block-languages';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverTrigger,
} from '@/registry/components/editor/floating-popover';

/** What a wrapper such as `withDiagrams` adds to either code-block variant. */
export type CodeBlockAddon = Readonly<{
  languageOptions?: readonly CodeBlockLanguageOption[];
  toolbar?: React.ReactNode;
  wrapSource?: (source: React.ReactNode) => React.ReactNode;
}>;

export type CodeBlockElementProps = EditorElementProps<
  typeof CodeBlockPlugin
> & {
  addon?: CodeBlockAddon;
  showLanguageLabel?: boolean;
};

/** What `createCodeBlockPlugin` takes: `CodeBlockElement`, `CodeBlockCodeMirrorElement` or a wrapped one. */
export type CodeBlockComponent = (
  props: CodeBlockElementProps
) => React.ReactElement;

export function CodeBlockContainer({
  addon,
  children,
  elementProps,
  languageOptions = codeBlockLanguages,
  showLanguageLabel = true,
}: {
  children: React.ReactNode;
  elementProps: EditorElementProps<typeof CodeBlockPlugin>;
  addon?: CodeBlockAddon;
  languageOptions?: readonly CodeBlockLanguageOption[];
  showLanguageLabel?: boolean;
}) {
  const { editor, element, attributes, plugin, ref, slots } = elementProps;
  const readOnly = useEditorReadOnly();
  const addedOptions = addon?.languageOptions;
  const options = React.useMemo(
    () =>
      addedOptions
        ? [
            ...languageOptions,
            ...addedOptions.filter(
              (added) =>
                !languageOptions.some((own) => own.value === added.value)
            ),
          ]
        : languageOptions,
    [addedOptions, languageOptions]
  );

  return (
    <EditorElement
      className={cn('py-1', codeSyntaxClassName)}
      attributes={{ ...attributes, dir: 'ltr' }}
      element={element}
      plugin={plugin}
      ref={ref}
      slots={slots}
    >
      <div className="relative rounded-md bg-muted/50">
        {addon?.wrapSource ? addon.wrapSource(children) : children}

        <div
          className="absolute end-1 top-1 z-10 flex gap-0.5 select-none"
          contentEditable={false}
        >
          {addon?.toolbar}

          {!readOnly && element.language === 'json' && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6 text-xs"
              onClick={() => formatJsonCodeBlock(editor, element)}
              title="Format code"
            >
              <BracesIcon className="!size-3.5 text-muted-foreground" />
            </Button>
          )}

          <CodeBlockCombobox
            languageOptions={options}
            showLanguageLabel={showLanguageLabel}
          />

          <CodeBlockCopyButton />
        </div>
      </div>
    </EditorElement>
  );
}

export function formatJsonCodeBlock(editor: Editor, element: Element) {
  if (editor.read.view.isReadOnly()) return;

  const blockPath = editor.read.nodes.path(element);

  if (!blockPath) return;

  const block = editor.read.nodes.get(blockPath)?.[0];

  if (
    block !== element ||
    !ElementApi.isElement(block) ||
    block.type !== editor.plugin(CodeBlockPlugin).schema.type ||
    block.language !== 'json' ||
    block.children.length !== 1
  ) {
    return;
  }

  const [child] = block.children;

  if (!NodeApi.isText(child)) return;

  const { text } = child;
  let formatted: string;

  try {
    formatted = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return;
  }

  if (formatted === text) return;

  const diff = new DiffMatchPatch().diff_main(text, formatted, false);
  const edits: Array<{ end: number; start: number; text: string }> = [];
  let oldOffset = 0;
  let start: number | null = null;
  let replacement = '';

  for (const [operation, value] of diff) {
    if (operation === DiffOp.Equal) {
      if (start !== null) {
        edits.push({ start, end: oldOffset, text: replacement });
        start = null;
        replacement = '';
      }
      oldOffset += value.length;
    } else if (operation === DiffOp.Delete) {
      start ??= oldOffset;
      oldOffset += value.length;
    } else {
      start ??= oldOffset;
      replacement += value;
    }
  }

  if (start !== null) {
    edits.push({ start, end: oldOffset, text: replacement });
  }

  editor.update((tx) => {
    for (const edit of edits.reverse()) {
      const at = {
        anchor: { path: [...blockPath, 0], offset: edit.start },
        focus: { path: [...blockPath, 0], offset: edit.end },
      };

      if (edit.text) {
        tx.text.insert(edit.text, { at });
      } else {
        tx.text.delete({ at });
      }
    }
  });
}

function CodeBlockCopyButton() {
  const editor = useEditor();
  const element = useElement(CodeBlockPlugin);

  return (
    <CopyButton
      size="icon"
      variant="ghost"
      className="size-6 gap-1 text-xs text-muted-foreground"
      value={() => {
        const path = editor.read.nodes.path(element);

        return path ? editor.read.text.string(path) : '';
      }}
    />
  );
}

function CodeBlockCombobox({
  languageOptions,
  showLanguageLabel,
}: {
  languageOptions: readonly CodeBlockLanguageOption[];
  showLanguageLabel: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const readOnly = useEditorReadOnly();
  const editor = useEditor();
  const element = useElement(CodeBlockPlugin);
  const listId = React.useId();
  const value = element.language || 'plaintext';
  const activeValue = findCodeBlockLanguage(value, languageOptions)?.value;
  const [searchValue, setSearchValue] = React.useState('');

  const items = React.useMemo(
    () =>
      languageOptions.filter((language) =>
        matchesCodeBlockLanguageQuery(language, searchValue)
      ),
    [searchValue, languageOptions]
  );

  if (readOnly) {
    if (!showLanguageLabel) return null;

    return (
      <CodeBlockLanguageLabel
        languageOptions={languageOptions}
        lang={element.language}
      />
    );
  }

  return (
    <FloatingPopover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearchValue('');
      }}
    >
      <FloatingPopoverTrigger>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 justify-between gap-1 px-2 text-xs text-muted-foreground select-none"
          aria-controls={listId}
          aria-expanded={open}
          role="combobox"
        >
          {getCodeBlockLanguageLabel(value, languageOptions) ?? 'Plain Text'}
        </Button>
      </FloatingPopoverTrigger>
      <FloatingPopoverContent className="w-[200px] p-0" id={listId}>
        <Command shouldFilter={false}>
          <CommandInput
            className="h-9"
            value={searchValue}
            onValueChange={(innerValue) => {
              setSearchValue(innerValue);
            }}
            placeholder="Search language..."
          />
          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList className="h-[344px] overflow-y-auto">
            <CommandGroup>
              {items.map((language) => (
                <CommandItem
                  key={language.value}
                  className="cursor-pointer"
                  value={language.value}
                  onSelect={(selected) => {
                    const path = editor.read.nodes.path(element);

                    if (!path) return;

                    editor
                      .plugin(CodeBlockPlugin)
                      .update.set({ language: selected }, { at: path });
                    setSearchValue('');
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      activeValue === language.value
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </FloatingPopoverContent>
    </FloatingPopover>
  );
}

function CodeBlockLanguageLabel({
  languageOptions,
  lang,
}: {
  languageOptions: readonly CodeBlockLanguageOption[];
  lang?: string | null;
}) {
  const label = getCodeBlockLanguageLabel(lang, languageOptions);

  if (!label) return null;

  return (
    <span className="flex h-6 items-center px-2 text-xs text-muted-foreground select-none">
      {label}
    </span>
  );
}

function CopyButton({
  value,
  ...props
}: { value: (() => string) | string } & Omit<
  React.ComponentProps<typeof Button>,
  'value'
>) {
  const [status, setStatus] = React.useState<
    'idle' | 'copying' | 'copied' | 'failed'
  >('idle');

  React.useEffect(() => {
    if (status !== 'copied') return undefined;

    const timeout = setTimeout(() => {
      setStatus('idle');
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [status]);

  return (
    <Button
      disabled={status === 'copying'}
      onClick={async () => {
        setStatus('copying');
        try {
          await navigator.clipboard.writeText(
            typeof value === 'function' ? value() : value
          );
          setStatus('copied');
        } catch {
          setStatus('failed');
        }
      }}
      title={status === 'failed' ? 'Copy failed. Try again.' : 'Copy'}
      {...props}
    >
      <span className="sr-only">
        {status === 'failed' ? 'Copy failed. Try again.' : 'Copy'}
      </span>
      {status === 'copied' ? (
        <CheckIcon className="!size-3" />
      ) : (
        <CopyIcon className="!size-3" />
      )}
    </Button>
  );
}

export const createCodeBlockPlugin = (
  component: CodeBlockComponent,
  options?: {
    normalizeLanguage?: (language: string) => string | undefined;
  }
) => {
  const normalizeLanguage =
    options?.normalizeLanguage ?? resolveCodeBlockLanguage;

  return CodeBlockPlugin.configure({
    component,
    inputRules: [
      CodeBlockRules.markdown({
        normalizeLanguage,
        on: 'space',
      }),
      CodeBlockRules.markdown({
        normalizeLanguage,
        on: 'break',
      }),
    ],
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  });
};
