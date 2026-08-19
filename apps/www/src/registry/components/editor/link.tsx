'use client';

import * as React from 'react';
import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorSelection,
  usePluginStore,
} from 'platejs/react';
import { LinkPlugin } from '@platejs/link/react';
import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';
import {
  type UseVirtualFloatingOptions,
  flip,
  getDOMSelectionBoundingClientRect,
  offset,
  useVirtualFloating,
} from '@platejs/floating';
import { LinkRules } from '@platejs/link';
import { useHotkeys } from '@udecode/react-hotkeys';
import { useComposedRef, useOnClickOutside } from '@udecode/react-utils';
import { cva } from 'class-variance-authority';
import { ExternalLink, Link, Text, Unlink } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { commentPlugin } from '@/registry/components/editor/comment';
import { suggestionPlugin } from '@/registry/components/editor/suggestion';

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
        onMouseOver: (event) => event.stopPropagation(),
      }}
    >
      {props.children}
    </PlateElement>
  );
}

const popoverVariants = cva(
  'z-50 w-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-hidden'
);

const inputVariants = cva(
  'flex h-[28px] w-full rounded-md border-none bg-transparent px-1.5 py-1 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-transparent md:text-sm'
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
    const hide = () => store.set({ ...transientState });
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
        if (!editor.read.selection()) return;

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

        if (!forceSubmit && !api.validateUrl(url)) return;

        api.hide();
        update.upsert({
          skipValidation: true,
          target: newTab ? '_blank' : undefined,
          text,
          url,
        });
        setTimeout(() => editor.api.dom.focus(), 0);

        return true;
      },
      triggerEdit: () => {
        const selection = editor.read.selection();

        if (!selection) return;

        const entry = editor.read.nodes.above({
          at: selection,
          type: linkPlugin,
        });

        if (!entry) return;

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
        if (store.get().mode || !focused) return;
        if (editor.read.selection.isAcrossBlocks()) return;

        const selection = editor.read.selection();

        if (!selection) return;
        if (editor.read.nodes.some({ at: selection, type: linkPlugin })) return;

        store.set({ text: editor.read.text.string() });
        api.show('insert', editor.id);

        return true;
      },
    }),
  }))
  .extend(({ api }) => ({
    api: () => ({
      trigger: (options: { focused?: boolean } = {}) => {
        if (!options.focused) return;

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
    if (!inputRef.current || !updated) return;

    setTimeout(() => {
      const input = inputRef.current;

      if (!input || focused.current) return;

      focused.current = true;
      input.focus();
      input.value = store.get().url ? api.decodeUrl(store.get().url) : '';
    }, 0);
  }, [api, store, updated]);

  return (
    <input
      ref={useComposedRef(inputRef, ref)}
      defaultValue={store.get().url}
      onChange={(event) =>
        store.set({ url: api.encodeUrl(event.target.value) })
      }
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
  const selection = useEditorSelection();
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
    onOpenChange: (nextOpen) =>
      store.set({ openEditorId: nextOpen ? editor.id : null }),
    open: editOpen,
    ...resolvedFloatingOptions,
  });
  const insertFloating = useVirtualFloating({
    getBoundingClientRect: getDOMSelectionBoundingClientRect,
    onOpenChange: (nextOpen) =>
      store.set({ openEditorId: nextOpen ? editor.id : null }),
    open: !readOnly && open && mode === 'insert',
    whileElementsMounted: () => () => {},
    ...resolvedFloatingOptions,
  });

  React.useEffect(() => {
    if (readOnly) {
      if (store.get().openEditorId === editor.id) api.hide();

      return;
    }

    const currentSelection = editor.read.selection();

    if (
      currentSelection &&
      editor.read.selection.isCollapsed() &&
      editor.read.nodes.some({ at: currentSelection, type: linkPlugin })
    ) {
      api.show('edit', editor.id);
      editFloating.update();
      return;
    }
    if (store.get().mode === 'edit') api.hide();
    // `update` is stable; depending on the floating result object would rerun
    // this effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, editor, readOnly, selection, store, editFloating.update]);

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
      insertFloating.update();
      store.set({ updated: true });
    } else {
      store.set({ updated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, insertFloating.update]);

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
    onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) =>
      event.preventDefault(),
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
          className={inputVariants()}
          placeholder="Paste link"
          data-plate-focus
        />
      </div>
      <Separator className="my-1" />
      <div className="flex items-center">
        <div className="flex items-center pr-1 pl-2 text-muted-foreground">
          <Text className="size-4" />
        </div>
        <input
          className={inputVariants()}
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
      <button
        className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        type="button"
        {...editButtonProps}
      >
        Edit link
      </button>

      <Separator orientation="vertical" />

      <LinkOpenButton />

      <Separator orientation="vertical" />

      <button
        className={buttonVariants({
          size: 'sm',
          variant: 'ghost',
        })}
        type="button"
        {...unlinkButtonProps}
      >
        <Unlink width={18} />
      </button>
    </div>
  );

  return (
    <>
      <div ref={insertRef} className={popoverVariants()} {...insertProps}>
        {input}
      </div>

      <div ref={editRef} className={popoverVariants()} {...editProps}>
        {editContent}
      </div>
    </>
  );
}

function LinkOpenButton() {
  const editor = useEditor();
  const selection = useEditorSelection();

  const attributes = React.useMemo(
    () => {
      const entry = editor.read.nodes.find({
        type: linkPlugin,
      });
      if (!entry) {
        return {};
      }
      const [element] = entry;
      return editor.plugin(linkPlugin).api.getAttributes(element);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, selection]
  );

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
