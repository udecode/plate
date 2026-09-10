'use client';

import {
  flip,
  offset,
  shift,
  useDismiss,
  useInteractions,
} from '@floating-ui/react';
import { cva } from 'class-variance-authority';
import { ExternalLink, Link, Text, Unlink } from 'lucide-react';
import { LinkRules } from 'platejs';
import {
  type EditableSiblingProps,
  LinkPlugin,
  type PlateElementProps,
  PlateElement,
  useComposedRef,
  useEditor,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorSelection,
  useEditorSelector,
  usePluginStore,
  useSelectionGeometry,
} from 'platejs/react';
import * as React from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  type UseWidgetFloatingOptions,
  useWidgetFloating,
} from '@/registry/hooks/use-widget-floating';
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
  'cn-popover-content z-50 w-auto p-1 outline-hidden transition-none'
);

type FloatingLinkMode = '' | 'edit' | 'insert';

const transientState = {
  isEditing: false,
  mode: '' as FloatingLinkMode,
  mouseDown: false,
  newTab: false,
  openEditorId: null as string | null,
  text: '',
  url: '',
};

const initialState = {
  ...transientState,
  forceSubmit: false,
};

const linkFloatingOptions = {
  middleware: [
    offset(8),
    flip({
      fallbackPlacements: ['top-end', 'bottom-start', 'bottom-end'],
      padding: 12,
    }),
    shift({ padding: 8 }),
  ],
  placement: 'top-start',
} satisfies UseWidgetFloatingOptions;

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
  .extend({
    api: ({ api, editor, store, update }) => ({
      submit: () => {
        if (!editor.read.selection()) return undefined;

        const { forceSubmit, newTab, text, url } = store.get();
        const inserted = update.upsert({
          skipValidation: forceSubmit,
          target: newTab ? '_blank' : undefined,
          text,
          url,
        });

        if (!inserted) return undefined;

        api.hide();
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
  })
  .extend({
    api: ({ api }) => ({
      trigger: (options: { focused?: boolean } = {}) => {
        if (!options.focused) return undefined;

        return api.triggerEdit() ?? api.triggerInsert(options);
      },
    }),
  })
  .extend(({ api, store }) => ({
    shortcuts: {
      dismiss: {
        keys: 'escape',
        handler: () => {
          if (!store.get().mode) return false;
          api.hide();
          return true;
        },
      },
      trigger: {
        keys: 'mod+k',
        handler: ({ editor }): boolean =>
          !editor.read.view.isReadOnly() &&
          editor.plugin(linkPlugin).api.trigger({
            focused: editor.read.view.isFocused(),
          }) === true,
      },
    },
  }));

function FloatingLinkUrlInput({
  ...props
}: React.ComponentPropsWithRef<'input'>) {
  const { api, store } = useEditorPlugin(linkPlugin);

  return (
    <Input
      defaultValue={api.decodeUrl(store.get().url)}
      onChange={(event) => {
        store.set({ url: event.target.value });
      }}
      {...props}
    />
  );
}

export function LinkFloatingToolbar({ editableRef }: EditableSiblingProps) {
  const editor = useEditor();

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
  const geometry = useSelectionGeometry({ editableRef });
  const editOpen =
    !readOnly && open && mode === 'edit' && editor.read.selection.isCollapsed();
  const editFloating = useWidgetFloating(geometry, {
    onOpenChange: (nextOpen) => {
      if (!nextOpen) api.hide();
    },
    open: editOpen,
    ...linkFloatingOptions,
  });
  const insertFloating = useWidgetFloating(geometry, {
    onOpenChange: (nextOpen) => {
      if (nextOpen) return;
      api.hide();
      editor.api.dom.focus();
    },
    open: !readOnly && open && mode === 'insert',
    ...linkFloatingOptions,
  });

  React.useEffect(() => {
    if (readOnly) {
      if (store.get().openEditorId === editor.id) api.hide();

      return;
    }

    if (selectedLinkKey) {
      api.show('edit', editor.id);
      return;
    }
    if (store.get().mode === 'edit') api.hide();
  }, [api, editor, readOnly, selectedLinkKey, store]);

  const editDismiss = useDismiss(editFloating.context, {
    escapeKey: false,
    outsidePress: () => store.get().isEditing,
  });
  const insertDismiss = useDismiss(insertFloating.context, {
    escapeKey: false,
  });
  const editInteractions = useInteractions([editDismiss]);
  const insertInteractions = useInteractions([insertDismiss]);
  const floatingElement =
    mode === 'insert'
      ? insertFloating.elements.floating
      : editFloating.elements.floating;

  React.useEffect(() => {
    const view = floatingElement?.ownerDocument.defaultView;

    if (!view || !open || (mode !== 'insert' && !isEditing)) return undefined;

    let timeout: number | undefined;
    const onBlur = () => {
      view.clearTimeout(timeout);
      // Iframe focus does not dispatch an outside pointer event in this document.
      timeout = view.setTimeout(() => {
        if (
          floatingElement.ownerDocument.activeElement?.localName === 'iframe'
        ) {
          api.hide();
        }
      }, 0);
    };

    view.addEventListener('blur', onBlur);
    return () => {
      view.removeEventListener('blur', onBlur);
      view.clearTimeout(timeout);
    };
  }, [api, floatingElement, isEditing, mode, open]);

  const { text } = store.get();
  const editButtonProps = { onClick: api.triggerEdit };
  const onFloatingKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    if (mode === 'edit' && store.get().isEditing) {
      api.show('edit', editor.id);
    } else {
      api.hide();
    }
    editor.api.dom.focus();
  };
  const editProps = {
    onKeyDown: onFloatingKeyDown,
    style: { ...editFloating.style, zIndex: 50 },
  };
  const editRef = useComposedRef(editFloating.refs.setFloating);
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
  const insertProps = {
    onKeyDown: onFloatingKeyDown,
    style: { ...insertFloating.style, zIndex: 50 },
  };
  const insertRef = useComposedRef(insertFloating.refs.setFloating);
  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.stopPropagation();
    api.submit();
  };
  const urlInputRef = React.useRef<HTMLInputElement>(null);
  const shouldFocusUrlInput =
    !readOnly &&
    open &&
    !!geometry &&
    ((mode === 'insert' && insertFloating.isPositioned) ||
      (mode === 'edit' && isEditing && editFloating.isPositioned));

  React.useEffect(() => {
    if (shouldFocusUrlInput) {
      urlInputRef.current?.focus({ preventScroll: true });
    }
  }, [shouldFocusUrlInput]);

  const textInputProps = {
    defaultValue: text,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      store.set({ text: event.target.value });
    },
    onKeyDown: onInputKeyDown,
  };

  if (readOnly || !open) return null;

  const input = (
    <div className="flex w-[330px] max-w-[calc(100vw-16px)] flex-col">
      <div className="flex items-center">
        <div className="flex items-center pr-1 pl-2 text-muted-foreground">
          <Link className="size-4" />
        </div>

        <FloatingLinkUrlInput
          ref={urlInputRef}
          className="h-7 border-none bg-transparent px-1.5 py-1 shadow-none focus-visible:ring-transparent"
          placeholder="Paste link"
          data-plite-keep-selection-visible
          onKeyDown={onInputKeyDown}
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
          data-plite-keep-selection-visible
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

  if (mode === 'insert') {
    return (
      <div
        ref={insertRef}
        className={cn(popoverVariants(), 'p-0')}
        {...insertInteractions.getFloatingProps(insertProps)}
      >
        {input}
      </div>
    );
  }

  return (
    <div
      ref={editRef}
      className={cn(popoverVariants(), isEditing && 'p-0')}
      {...editInteractions.getFloatingProps(editProps)}
    >
      {editContent}
    </div>
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
    slots: {
      afterEditable: LinkFloatingToolbar,
    },
  }),
] as const;
