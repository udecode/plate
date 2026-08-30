'use client';

import { cva } from 'class-variance-authority';
import { ExternalLink, Link, Text, Unlink } from 'lucide-react';
import { LinkRules } from 'platejs';
import {
  type UseVirtualFloatingOptions,
  flip,
  getDOMSelectionBoundingClientRect,
  offset,
  useVirtualFloating,
} from 'platejs/floating/react';
import {
  LinkPlugin,
  type PlateElementProps,
  PlateElement,
  useComposedRef,
  useHotkeys,
  useEditor,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorSelection,
  useEditorSelector,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { commentPlugin } from '@/registry/components/editor/comment';
import { suggestionPlugin } from '@/registry/components/editor/suggestion';
import { useOnClickOutside } from '@/registry/hooks/use-on-click-outside';
import { inlineSuggestionVariants } from '@/registry/lib/inline-suggestion';

export function LinkElement(props: PlateElementProps<typeof LinkPlugin>) {
  return (
    <PlateElement
      {...props}
      as="a"
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        inlineSuggestionVariants()
      )}
      attributes={{
        ...props.attributes,
        ...props.editor.plugin(LinkPlugin).api.getAttributes(props.element),
        onMouseOver: (event: React.MouseEvent<HTMLAnchorElement>) => {
          event.stopPropagation();
        },
      }}
    >
      {props.children}
    </PlateElement>
  );
}

const popoverVariants = cva(
  'cn-popover-content z-50 w-auto p-1 outline-hidden'
);

const percentEscapeCapture = /(%[\dA-Fa-f]{2})/;

const percentEscape = /^%[\dA-Fa-f]{2}$/;

type FloatingLinkMode = '' | 'edit' | 'insert';

type FloatingLinkOptions = {
  floatingOptions?: UseVirtualFloatingOptions;
};

const transientState = {
  isEditing: false,
  mode: '' as FloatingLinkMode,
  mouseDown: false,
  newTab: false,
  openEditorId: null as string | null,
  text: '',
  updated: false,
  url: '',
};

const initialState = {
  ...transientState,
  forceSubmit: false,
  triggerFloatingLinkHotkeys: 'meta+k, ctrl+k' as readonly string[] | string,
};

export const linkPlugin = LinkPlugin.extend({ initialState })
  .extend(({ store }) => {
    const hide = () => {
      store.set({ ...transientState });
    };
    const show = (mode: FloatingLinkMode, editorId: string) => {
      store.set({ isEditing: false, mode, openEditorId: editorId });
    };

    return {
      api: () => ({
        decodeUrl: (url: string) => {
          try {
            return decodeURI(url);
          } catch (error) {
            if (error instanceof URIError) return url;
            throw error;
          }
        },
        encodeUrl: (url: string) => {
          try {
            return url
              .split(percentEscapeCapture)
              .map((part) =>
                percentEscape.test(part)
                  ? part
                  : encodeURI(part).replaceAll('%25', '%')
              )
              .join('');
          } catch (error) {
            if (error instanceof URIError) return url;
            throw error;
          }
        },
        hide,
        reset: () => {
          store.set({
            ...transientState,
            openEditorId: store.get('openEditorId'),
          });
        },
        show,
      }),
      selectors: {
        isOpen: (state, editorId: string) => state.openEditorId === editorId,
      },
    };
  })
  .extend(({ api, editor, store, update }) => ({
    api: () => ({
      submit: () => {
        if (!editor.read.selection()) return undefined;

        const {
          forceSubmit,
          newTab,
          text,
          transformInput,
          url: inputUrl,
        } = store.get();
        const url = transformInput
          ? (transformInput(inputUrl) ?? '')
          : inputUrl;

        if (!forceSubmit && !api.validateUrl(url)) return undefined;

        api.hide();
        update.upsert({
          skipValidation: true,
          target: newTab ? '_blank' : undefined,
          text,
          url,
        });
        setTimeout(() => {
          editor.api.dom.focus();
        }, 0);

        return true;
      },
      triggerEdit: () => {
        const selection = editor.read.selection();

        if (!selection) return undefined;

        const entry = editor.read.nodes.above({
          at: selection,
          type: linkPlugin,
        });

        if (!entry) return undefined;

        const [link, path] = entry;
        const linkText = editor.read.text.string(path);

        api.show('edit', editor.id);
        store.set({
          isEditing: true,
          newTab: link.target === '_blank',
          text: linkText === link.url ? '' : linkText,
          url: link.url,
        });

        return true;
      },
      triggerInsert: ({ focused }: { focused?: boolean } = {}) => {
        if (store.get().mode || !focused) return undefined;
        if (editor.read.selection.isAcrossBlocks()) return undefined;

        const selection = editor.read.selection();

        if (!selection) return undefined;
        if (editor.read.nodes.some({ at: selection, type: linkPlugin })) {
          return undefined;
        }

        store.set({ text: editor.read.text.string() });
        api.show('insert', editor.id);

        return true;
      },
    }),
  }))
  .extend(({ api }) => ({
    api: () => ({
      trigger: (options: { focused?: boolean } = {}) => {
        if (!options.focused) return undefined;

        return api.triggerEdit() ?? api.triggerInsert(options);
      },
    }),
  }));

function FloatingLinkUrlInput({
  ref,
  ...props
}: React.ComponentPropsWithRef<'input'>) {
  const { api, store } = useEditorPlugin(linkPlugin);
  const updated = usePluginStore(linkPlugin, 'updated');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const focused = React.useRef(false);

  React.useEffect(() => {
    if (!inputRef.current || !updated) return undefined;

    const timeout = setTimeout(() => {
      const input = inputRef.current;

      if (!input || focused.current) return;

      focused.current = true;
      input.focus();
      input.value = store.get().url ? api.decodeUrl(store.get().url) : '';
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [api, store, updated]);

  return (
    <Input
      ref={useComposedRef(inputRef, ref)}
      defaultValue={store.get().url}
      onChange={(event) => {
        store.set({ url: api.encodeUrl(event.target.value) });
      }}
      {...props}
    />
  );
}

export function LinkFloatingToolbar({
  options,
}: {
  options?: FloatingLinkOptions;
}) {
  const activeCommentId = usePluginStore(commentPlugin, 'activeId');
  const activeSuggestionId = usePluginStore(suggestionPlugin, 'activeId');

  const floatingOptions: UseVirtualFloatingOptions = React.useMemo(
    () => ({
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
          padding: 12,
        }),
      ],
      placement:
        activeSuggestionId || activeCommentId ? 'top-start' : 'bottom-start',
    }),
    [activeCommentId, activeSuggestionId]
  );

  const editor = useEditor();
  const triggerHotkeys = usePluginStore(
    linkPlugin,
    'triggerFloatingLinkHotkeys'
  );
  const readOnly = useEditorReadOnly();
  const isEditing = usePluginStore(linkPlugin, 'isEditing');
  const selectedLinkKey = useEditorSelector(
    (innerEditor) => {
      const selection = innerEditor.read.selection();

      if (!selection || !innerEditor.read.selection.isCollapsed()) return null;

      const entry = innerEditor.read.nodes.above({
        at: selection,
        type: linkPlugin,
      });

      return entry ? innerEditor.key(entry[0]) : null;
    },
    {
      shouldUpdate: (change) =>
        !change || change.selectionChanged || change.changed.hasAny('document'),
    }
  );
  const mode = usePluginStore(linkPlugin, 'mode');
  const open = usePluginStore(linkPlugin, 'isOpen', editor.id);
  const { api, store, update } = useEditorPlugin(linkPlugin);
  const resolvedFloatingOptions = {
    ...floatingOptions,
    ...options?.floatingOptions,
  };
  const getBoundingClientRect = React.useCallback(() => {
    const entry = editor.read.nodes.above({ type: linkPlugin });

    if (entry) {
      const range = editor.read.ranges.get(entry[1]);
      const rect = range
        ? editor.api.dom.resolveDOMRange(range)?.getBoundingClientRect()
        : undefined;

      if (rect) return rect;
    }

    return getDOMSelectionBoundingClientRect();
  }, [editor]);
  const editOpen =
    !readOnly && open && mode === 'edit' && editor.read.selection.isCollapsed();
  const editFloating = useVirtualFloating({
    getBoundingClientRect,
    onOpenChange: (nextOpen) => {
      store.set({ openEditorId: nextOpen ? editor.id : null });
    },
    open: editOpen,
    ...resolvedFloatingOptions,
  });
  const insertFloating = useVirtualFloating({
    getBoundingClientRect: getDOMSelectionBoundingClientRect,
    onOpenChange: (nextOpen) => {
      store.set({ openEditorId: nextOpen ? editor.id : null });
    },
    open: !readOnly && open && mode === 'insert',
    whileElementsMounted: () => () => {},
    ...resolvedFloatingOptions,
  });
  const updateEditFloating = editFloating.update;
  const updateInsertFloating = insertFloating.update;

  React.useEffect(() => {
    if (readOnly) {
      if (store.get().openEditorId === editor.id) api.hide();

      return;
    }

    if (selectedLinkKey) {
      api.show('edit', editor.id);
      updateEditFloating();
      return;
    }
    if (store.get().mode === 'edit') api.hide();
    // `update` is stable; depending on the floating result object would rerun
    // this effect on every render.
  }, [api, editor, readOnly, selectedLinkKey, store, updateEditFloating]);

  useHotkeys(
    triggerHotkeys ?? 'meta+k, ctrl+k',
    (event) => {
      const triggered = api.trigger({
        focused: editor.read.view.isFocused(),
      });

      if (triggered) event.preventDefault();
    },
    { enabled: !readOnly, enableOnContentEditable: true },
    []
  );
  useHotkeys(
    '*',
    (event) => {
      if (event.key === 'Enter' && api.submit()) event.preventDefault();
    },
    { enabled: !readOnly && open, enableOnFormTags: ['INPUT'] },
    []
  );
  useHotkeys(
    'escape',
    (event) => {
      const { isEditing: editing, mode: currentMode } = store.get();

      if (!currentMode) return;

      event.preventDefault();
      if (currentMode === 'edit' && editing) {
        api.show('edit', editor.id);
        editor.api.dom.focus();
        return;
      }
      if (currentMode === 'insert') editor.api.dom.focus();
      api.hide();
    },
    {
      enabled: !readOnly && open,
      enableOnContentEditable: true,
      enableOnFormTags: ['INPUT'],
    },
    []
  );

  const editClickOutsideRef = useOnClickOutside(() => {
    if (store.get().isEditing) api.hide();
  });
  const insertClickOutsideRef = useOnClickOutside(
    () => {
      if (store.get().mode === 'insert') {
        api.hide();
        editor.api.dom.focus();
      }
    },
    { disabled: !open }
  );

  React.useEffect(() => {
    if (open) {
      updateInsertFloating();
      store.set({ updated: true });
    } else {
      store.set({ updated: false });
    }
  }, [open, store, updateInsertFloating]);

  const { text, updated } = store.get();
  const editButtonProps = { onClick: api.triggerEdit };
  const editProps = { style: { ...editFloating.style, zIndex: 50 } };
  const editRef = useComposedRef<HTMLElement | null>(
    editFloating.refs.setFloating,
    editClickOutsideRef
  );
  const unlinkButtonProps = {
    onClick: () => {
      update.unwrap();
      api.hide();
      editor.api.dom.focus();
    },
    onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    },
  };
  const insertProps = { style: { ...insertFloating.style, zIndex: 50 } };
  const insertRef = useComposedRef<HTMLDivElement>(
    insertFloating.refs.setFloating,
    insertClickOutsideRef
  );
  const textInputProps = {
    defaultValue: text,
    ref: (element: HTMLInputElement) => {
      if (element && updated) element.value = store.get().text;
    },
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      store.set({ text: event.target.value });
    },
  };

  if (readOnly || !open) return null;

  const input = (
    <div
      className="flex w-[330px] flex-col"
      onKeyDownCapture={(event) => {
        if (event.key === 'Enter') event.preventDefault();
      }}
    >
      <div className="flex items-center">
        <div className="flex items-center pr-1 pl-2 text-muted-foreground">
          <Link className="size-4" />
        </div>

        <FloatingLinkUrlInput
          className="h-7 border-none bg-transparent px-1.5 py-1 shadow-none focus-visible:ring-transparent"
          placeholder="Paste link"
          data-plate-focus
        />
      </div>
      <Separator className="my-1" />
      <div className="flex items-center">
        <div className="flex items-center pr-1 pl-2 text-muted-foreground">
          <Text className="size-4" />
        </div>
        <Input
          className="h-7 border-none bg-transparent px-1.5 py-1 shadow-none focus-visible:ring-transparent"
          placeholder="Text to display"
          data-plate-focus
          {...textInputProps}
        />
      </div>
    </div>
  );

  const editContent = isEditing ? (
    input
  ) : (
    <div className="box-content flex items-center">
      <Button size="sm" type="button" variant="ghost" {...editButtonProps}>
        Edit link
      </Button>

      <Separator orientation="vertical" />

      <LinkOpenButton />

      <Separator orientation="vertical" />

      <Button size="sm" type="button" variant="ghost" {...unlinkButtonProps}>
        <Unlink width={18} />
      </Button>
    </div>
  );

  return (
    <>
      <div
        ref={insertRef}
        className={cn(popoverVariants(), 'p-0')}
        {...insertProps}
      >
        {input}
      </div>

      <div
        ref={editRef}
        className={cn(popoverVariants(), isEditing && 'p-0')}
        {...editProps}
      >
        {editContent}
      </div>
    </>
  );
}

function LinkOpenButton() {
  const editor = useEditor();
  useEditorSelection();
  const entry = editor.read.nodes.find({ type: linkPlugin });
  const attributes = entry
    ? editor.plugin(linkPlugin).api.getAttributes(entry[0])
    : {};

  return (
    <a
      {...attributes}
      className={buttonVariants({
        size: 'sm',
        variant: 'ghost',
      })}
      onMouseOver={(e) => {
        e.stopPropagation();
      }}
      onFocus={(e) => {
        e.stopPropagation();
      }}
      aria-label="Open link in a new tab"
      target="_blank"
    >
      <ExternalLink width={18} />
    </a>
  );
}

export const LinkKit = [
  linkPlugin.configure({
    component: LinkElement,
    inputRules: [
      LinkRules.markdown(),
      LinkRules.autolink({ variant: 'paste' }),
      LinkRules.autolink({ variant: 'space' }),
      LinkRules.autolink({ variant: 'break' }),
    ],
    render: {
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
] as const;
