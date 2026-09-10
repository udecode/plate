'use client';

import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { NodeApi } from 'platejs';
import { isHotkey } from 'platejs/dom';
import { BaseFindPlugin } from 'platejs/find';
import {
  type Editor,
  toPlatePlugin,
  useEditor,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const FindContext = React.createContext<{
  close: () => void;
  open: (query?: string) => void;
} | null>(null);

/** Commands for the Find UI in the current Editable's slots. */
export function useFind() {
  const find = React.useContext(FindContext);

  if (!find) throw new Error('useFind requires an Editable with FindKit');

  return find;
}

const getSelectedText = (editor: Editor) => {
  const selection = editor.read.selection();

  if (!selection || editor.read.selection.isCollapsed()) return undefined;

  return editor.read
    .fragment({ at: selection })
    .map((node) => NodeApi.string(node))
    .join('\n');
};

function FindRoot({
  children,
  editableRef,
}: {
  children: React.ReactNode;
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  const editor = useEditor();
  const [state, setState] = React.useState<{
    draft: { query: string } | null;
  } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const commands = React.useMemo(
    () => ({
      close: () => {
        setState(null);
        editor.plugin(BaseFindPlugin).api.search('');
        editor.api.dom.focus();
      },
      open: (query?: string) => {
        setState({ draft: query === undefined ? null : { query } });
        inputRef.current?.focus();
        inputRef.current?.select();
      },
    }),
    [editor]
  );

  React.useEffect(() => {
    const element = editableRef.current;
    if (!element) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target !== element ||
        event.isComposing ||
        // oxlint-disable-next-line typescript/no-deprecated -- Safari can clear isComposing before the final IME key event.
        event.keyCode === 229 ||
        !isHotkey('mod+f', event)
      ) {
        return;
      }

      event.preventDefault();
      commands.open(getSelectedText(editor));
    };
    element.addEventListener('keydown', onKeyDown);
    return () => element.removeEventListener('keydown', onKeyDown);
  }, [commands, editableRef, editor]);

  return (
    <FindContext.Provider value={commands}>
      {children}
      {state && (
        <FindBar draft={state.draft} inputRef={inputRef} setState={setState} />
      )}
    </FindContext.Provider>
  );
}

function FindBar({
  draft,
  inputRef,
  setState,
}: {
  draft: { query: string } | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setState: React.Dispatch<
    React.SetStateAction<{ draft: { query: string } | null } | null>
  >;
}) {
  const editor = useEditor();
  const { api } = editor.plugin(BaseFindPlugin);
  const { close } = useFind();
  const query = usePluginStore(BaseFindPlugin, 'query');
  const count = usePluginStore(BaseFindPlugin, 'count');
  const activeIndex = usePluginStore(BaseFindPlugin, 'activeIndex');
  const error = usePluginStore(BaseFindPlugin, 'error');
  const activeMatch = usePluginStore(BaseFindPlugin, 'activeMatch');
  const deferredDraft = React.useDeferredValue(draft);
  const [focused, setFocused] = React.useState(false);
  const inputQuery = draft?.query ?? query;

  React.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [inputRef]);

  React.useEffect(() => {
    if (!deferredDraft) return;

    api.search(deferredDraft.query);
    setState((current) =>
      current?.draft === deferredDraft ? { draft: null } : current
    );
  }, [api, deferredDraft, setState]);

  React.useEffect(() => {
    if (!activeMatch || !focused) return undefined;

    return editor.api.dom.scrollIntoView(activeMatch.range, {
      block: 'nearest',
      inline: 'nearest',
      scrollMode: 'if-needed',
    });
  }, [activeMatch, editor, focused]);

  const countLabel =
    count === 0 ? 'No results' : `${activeIndex + 1} of ${count}`;

  return (
    <div
      aria-busy={inputQuery !== query}
      aria-label="Find in document"
      className="absolute top-2 right-2 z-[60] w-[min(24rem,calc(100%-1rem))] rounded-xl border bg-background p-2 shadow-lg"
      data-plite-keep-selection-visible=""
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocusCapture={() => setFocused(true)}
      role="search"
    >
      <InputGroup>
        <InputGroupAddon>
          <Search aria-hidden data-icon="inline-start" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          aria-label="Find text"
          onChange={(event) =>
            setState({ draft: { query: event.target.value } })
          }
          onKeyDown={(event) => {
            // oxlint-disable-next-line typescript/no-deprecated -- Safari can clear isComposing before the final IME key event.
            if (event.nativeEvent.isComposing || event.keyCode === 229) return;
            if (event.key === 'Escape') {
              event.preventDefault();
              close();

              return;
            }
            if (event.key !== 'Enter') return;

            event.preventDefault();
            if (event.shiftKey) {
              api.move(-1);
            } else {
              api.move(1);
            }
          }}
          placeholder="Find in document"
          type="search"
          value={inputQuery}
        />
        <InputGroupAddon align="inline-end">
          <span
            aria-live="polite"
            className="text-xs whitespace-nowrap text-muted-foreground"
          >
            {error?.message ?? countLabel}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label="Previous match"
                disabled={count === 0}
                onClick={() => api.move(-1)}
                size="icon-xs"
              >
                <ChevronUp aria-hidden data-icon="" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Previous match</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label="Next match"
                disabled={count === 0}
                onClick={() => api.move(1)}
                size="icon-xs"
              >
                <ChevronDown aria-hidden data-icon="" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Next match</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label="Close find"
                onClick={close}
                size="icon-xs"
              >
                <X aria-hidden data-icon="" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Close find</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export const FindKit = [
  toPlatePlugin(BaseFindPlugin).configure({
    editOnly: { render: false },
    decorate: {
      attributes: {
        className:
          'rounded-[2px] bg-yellow-200 text-inherit data-find-active:bg-orange-400! data-find-active:ring-1 data-find-active:ring-orange-600',
      },
    },
    slots: {
      wrapRoot: FindRoot,
    },
  }),
] as const;
