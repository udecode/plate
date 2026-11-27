'use client';

import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { createEditorView, NodeApi, SelectionApi } from 'platejs';
import { isHotkey } from 'platejs/dom';
import { BaseFindPlugin } from 'platejs/find';
import {
  type Editor,
  type WrapRootProps,
  toReactPlugin,
  useEditor,
  useEditorRootAreas,
  useEditorSelector,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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

const FORM_CONTROL_TAGS = new Set(['INPUT', 'OPTION', 'SELECT', 'TEXTAREA']);

const getParentShadowAware = (node: Node): Node | null =>
  node.parentNode ?? (node instanceof ShadowRoot ? node.host : null);

const containsShadowAware = (container: Node, target: Node): boolean => {
  let current: Node | null = target;

  while (current) {
    if (current === container) return true;
    current = getParentShadowAware(current);
  }

  return false;
};

const isIgnoredKeyTarget = (target: Node, rootElement: Element): boolean => {
  let current: Node | null = target;

  while (current && current !== rootElement) {
    if (current instanceof Element) {
      if (FORM_CONTROL_TAGS.has(current.tagName)) return true;
      if (current.hasAttribute('data-editor-root')) return false;
      const contentEditable = current
        .getAttribute('contenteditable')
        ?.toLowerCase();
      if (
        contentEditable === '' ||
        contentEditable === 'true' ||
        contentEditable === 'plaintext-only'
      ) {
        return true;
      }
    }
    current = getParentShadowAware(current);
  }

  return false;
};

const closestEditorRoot = (target: Node): Element | null => {
  let current: Node | null = target;

  while (current) {
    if (
      current instanceof Element &&
      current.hasAttribute('data-editor-root')
    ) {
      return current;
    }
    current = getParentShadowAware(current);
  }

  return null;
};

const getDeepActiveElement = (
  doc: Document | null | undefined
): Element | null => {
  let active = doc?.activeElement ?? null;

  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }

  return active;
};

function FindRoot({ children, editableRef }: WrapRootProps) {
  const editor = useEditor();
  const areas = useEditorRootAreas(editor);
  const [state, setState] = React.useState<{
    draft: { query: string } | null;
  } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const originRef = React.useRef<{ element: Element; view: Editor } | null>(
    null
  );

  const resolveOrigin = React.useCallback(
    (target: Node | null): { element: Element; view: Editor } | null => {
      const element = editableRef.current;

      if (
        !element ||
        !target ||
        !containsShadowAware(element, target) ||
        isIgnoredKeyTarget(target, element)
      ) {
        return null;
      }

      const rootElement = closestEditorRoot(target);

      if (!rootElement) return null;
      if (rootElement === element) return { element, view: editor };

      const rootName = rootElement.getAttribute('data-editor-root');
      const nested =
        rootName && rootName !== 'main' ? areas.nestedView(rootName) : null;

      return nested && nested.api.dom.editable() === rootElement
        ? { element: rootElement, view: nested }
        : null;
    },
    [areas, editableRef, editor]
  );

  const openFromOrigin = React.useCallback(
    (origin: { element: Element; view: Editor } | null, query?: string) => {
      originRef.current = origin;
      setState({ draft: query === undefined ? null : { query } });
      inputRef.current?.focus();
      inputRef.current?.select();
    },
    []
  );

  const commands = React.useMemo(
    () => ({
      close: () => {
        setState(null);
        editor.plugin(BaseFindPlugin).api.search('');
        const origin = originRef.current;
        originRef.current = null;
        const focusTarget =
          origin &&
          origin.element.isConnected &&
          origin.view.api.dom.editable() === origin.element
            ? origin.view
            : editor;
        if (focusTarget.api.dom.editable()) {
          focusTarget.api.dom.focus();
        }
      },
      open: (query?: string) => {
        const active = getDeepActiveElement(editableRef.current?.ownerDocument);
        openFromOrigin(resolveOrigin(active), query);
      },
    }),
    [editableRef, editor, openFromOrigin, resolveOrigin]
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.isDefaultPrevented() ||
      event.nativeEvent.defaultPrevented ||
      event.nativeEvent.isComposing ||
      // oxlint-disable-next-line typescript/no-deprecated -- Safari can clear isComposing before the final IME key event.
      event.keyCode === 229 ||
      !isHotkey('mod+f', event.nativeEvent)
    ) {
      return;
    }

    const rawTarget = event.nativeEvent.composedPath?.()[0] ?? event.target;
    const origin = rawTarget instanceof Node ? resolveOrigin(rawTarget) : null;

    if (!origin) return;

    event.preventDefault();
    openFromOrigin(origin, getSelectedText(origin.view));
  };

  return (
    <FindContext.Provider value={commands}>
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- Catches Mod+F bubbling from the mounted Editable and its nested content roots, which own the textbox role. */}
      <div className="contents" onKeyDown={onKeyDown}>
        {state && (
          <FindBar
            draft={state.draft}
            inputRef={inputRef}
            setState={setState}
          />
        )}
        {children}
        {!state && (
          <FindButton
            onOpen={() => {
              const active = getDeepActiveElement(
                editableRef.current?.ownerDocument
              );
              const origin = resolveOrigin(active);
              openFromOrigin(origin, getSelectedText(origin?.view ?? editor));
            }}
          />
        )}
      </div>
    </FindContext.Provider>
  );
}

function FindButton({ onOpen }: { onOpen: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Find"
            className="absolute end-2 top-2 z-[60]"
            onClick={onOpen}
            onMouseDown={(event) => event.preventDefault()}
            size="icon-sm"
            variant="outline"
          >
            <Search aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Find</TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
  const viewRoot = useEditorSelector((current) => current.read.view.root());
  const areas = useEditorRootAreas(editor);
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

    const matchRoot = SelectionApi.root(activeMatch.range);
    const target =
      matchRoot === viewRoot
        ? editor
        : ((matchRoot ? areas.nestedView(matchRoot) : null) ??
          createEditorView(editor, { readOnly: true, root: matchRoot }));

    // 'if-needed' ignores the match's scroll margin, so it would leave a
    // match under the stuck bar in place.
    return target.api.dom.scrollIntoView(activeMatch.range, {
      block: 'nearest',
      inline: 'nearest',
      scrollMode: 'always',
    });
  }, [activeMatch, areas, editor, focused, viewRoot]);

  const countLabel =
    count === 0 ? 'No results' : `${activeIndex + 1} of ${count}`;

  return (
    <div
      aria-busy={inputQuery !== query}
      aria-label="Find in document"
      className="sticky top-2 z-[60] ms-auto me-2 mt-2 w-[min(24rem,calc(100%-1rem))] rounded-xl border bg-background p-2 shadow-lg"
      data-editor-keep-selection-visible=""
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
          <TooltipProvider>
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
          </TooltipProvider>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export const FindKit = [
  toReactPlugin(BaseFindPlugin).configure({
    editOnly: { render: false },
    decorate: {
      attributes: {
        className:
          'scroll-mt-16 rounded-[2px] bg-yellow-200 text-inherit dark:bg-yellow-500/35 data-find-active:bg-orange-400! dark:data-find-active:bg-orange-500/50! data-find-active:ring-1 data-find-active:ring-orange-600 dark:data-find-active:ring-orange-400',
      },
    },
    slots: {
      wrapRoot: FindRoot,
    },
  }),
] as const;
