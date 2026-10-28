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
  type EditorElementProps,
  EditorElement,
  useComposedRef,
  useEditor,
  useEditorReadOnly,
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
  type UseFloatingRectOptions,
  useFloatingRect,
} from '@/registry/hooks/use-floating-rect';
import { inlineSuggestionVariants } from '@/registry/lib/inline-suggestion';

const sameAttributes = (left: object | null, right: object) => {
  if (!left) return false;
  const entries = Object.entries(left);

  return (
    entries.length === Object.keys(right).length &&
    entries.every(
      ([key, value]) =>
        Object.hasOwn(right, key) && Reflect.get(right, key) === value
    )
  );
};

export function LinkElement(props: EditorElementProps<typeof LinkPlugin>) {
  const { api } = props.editor.plugin(LinkPlugin);
  const attributes = usePluginStore(
    LinkPlugin,
    () => api.getAttributes(props.element),
    { equalityFn: sameAttributes }
  );

  return (
    <EditorElement
      {...props}
      as="a"
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        inlineSuggestionVariants()
      )}
      attributes={{
        ...props.attributes,
        ...attributes,
        onMouseOver: (event: React.MouseEvent<HTMLAnchorElement>) => {
          event.stopPropagation();
        },
      }}
    >
      {props.children}
    </EditorElement>
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

const DRAFT_ADDRESS =
  /^((?!https?:)[a-z][a-z\d+.-]*:|https?:\/\/|[#/?]|\.{1,2}\/)/i;

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
} satisfies UseFloatingRectOptions;

export const linkPlugin = LinkPlugin.extend({ initialState: transientState })
  .extend(({ store }) => {
    const hide = () => {
      store.set({ ...transientState });
    };
    const show = (mode: FloatingLinkMode, editorId: string) => {
      store.set({ isEditing: false, mode, openEditorId: editorId });
    };

    return {
      api: () => ({
        closeForm: () => {
          const { isEditing, mode, openEditorId } = store.get();

          if (!isEditing && mode !== 'insert') return false;
          store.set(
            isEditing
              ? { ...transientState, mode: 'edit', openEditorId }
              : { ...transientState }
          );

          return true;
        },
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
        const selection = editor.read.selection();

        if (!selection) return undefined;

        const { newTab, text, url } = store.get();
        const editedLink = editor.read.nodes.above({
          at: selection,
          type: linkPlugin,
        });

        if (editedLink && url === editedLink[0].url) {
          update.upsertText({ text: text || url, url });
        } else {
          const draft = url.trim();

          if (
            !DRAFT_ADDRESS.test(draft) ||
            !update.upsert({
              target: newTab ? '_blank' : undefined,
              text,
              url: draft,
            })
          ) {
            return undefined;
          }
        }

        api.closeForm();
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
        // The edit form shows only for a caret, so an edit mode started here
        // would have no form and would block Insert link.
        if (!editor.read.selection.isCollapsed()) return true;

        const [link, path] = entry;
        const linkText = editor.read.text.string(path);

        store.set({
          isEditing: true,
          mode: 'edit',
          newTab: link.target === '_blank',
          openEditorId: editor.id,
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

        const block = editor.read.nodes.block({ at: selection });

        if (
          block &&
          !editor.read.schema.allowsElementType(
            block[0].type,
            editor.plugin(LinkPlugin).schema.type
          )
        ) {
          return undefined;
        }

        store.set({ text: editor.read.text.string() });
        api.show('insert', editor.id);

        return true;
      },
    }),
  })
  .extend({
    api: ({ api, editor }) => ({
      trigger: ({
        focused = editor.read.view.isFocused(),
      }: { focused?: boolean } = {}) =>
        !editor.read.view.isReadOnly() &&
        focused &&
        (api.triggerEdit() ?? api.triggerInsert({ focused })) === true,
    }),
  })
  .extend(({ api, store }) => ({
    on: {
      focus: () => {
        api.closeForm();
      },
    },
    shortcuts: {
      dismiss: {
        keys: 'escape',
        handler: () => {
          if (!store.get().mode) return false;
          api.hide();
          return true;
        },
      },
      trigger: { keys: 'mod+k' },
    },
  }));

function FloatingLinkUrlInput({
  ...props
}: React.ComponentPropsWithRef<'input'>) {
  const { api, store } = useEditor().plugin(linkPlugin);
  const [defaultValue] = React.useState(() => api.decodeUrl(store.get().url));

  return (
    <Input
      defaultValue={defaultValue}
      onChange={(event) => {
        store.set({ url: event.target.value });
      }}
      {...props}
    />
  );
}

function FloatingLinkTextInput({
  ...props
}: React.ComponentPropsWithRef<'input'>) {
  const { store } = useEditor().plugin(linkPlugin);
  const [defaultValue] = React.useState(() => store.get().text);

  return (
    <Input
      defaultValue={defaultValue}
      onChange={(event) => {
        store.set({ text: event.target.value });
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
  const { api, store, update } = useEditor().plugin(linkPlugin);
  const geometry = useSelectionGeometry({ editableRef });
  const editOpen =
    !readOnly && open && mode === 'edit' && selectedLinkKey !== null;
  const editFloating = useFloatingRect(geometry?.boundingRect ?? null, {
    onOpenChange: (nextOpen) => {
      if (!nextOpen) api.closeForm();
    },
    open: editOpen,
    ...linkFloatingOptions,
  });
  const insertFloating = useFloatingRect(geometry?.boundingRect ?? null, {
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
    const ownerDocument = floatingElement?.ownerDocument;
    const view = ownerDocument?.defaultView;

    if (!ownerDocument || !view) return undefined;

    let timeout: number | undefined;
    const onBlur = () => {
      view.clearTimeout(timeout);
      // Iframe focus does not dispatch an outside pointer event in this document.
      timeout = view.setTimeout(() => {
        let active = ownerDocument.activeElement;

        while (active?.shadowRoot?.activeElement) {
          active = active.shadowRoot.activeElement;
        }
        if (active?.localName === 'iframe') api.closeForm();
      }, 0);
    };

    view.addEventListener('blur', onBlur);
    return () => {
      view.removeEventListener('blur', onBlur);
      view.clearTimeout(timeout);
    };
  }, [api, floatingElement]);

  const editButtonProps = { onClick: api.triggerEdit };
  const onFloatingKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    if (!api.closeForm()) api.hide();
    editor.api.dom.focus();
  };
  const onFloatingBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const focusLeftForm =
      event.relatedTarget !== null &&
      !event.currentTarget.contains(event.relatedTarget);

    if (focusLeftForm) api.closeForm();
  };
  const editProps = {
    onBlur: onFloatingBlur,
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
    onBlur: onFloatingBlur,
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
          data-editor-keep-selection-visible
          onKeyDown={onInputKeyDown}
        />
      </div>
      <Separator className="my-1" />
      <div className="flex items-center">
        <div className="flex items-center pr-1 pl-2 text-muted-foreground">
          <Text className="size-4" />
        </div>
        <FloatingLinkTextInput
          className="h-7 border-none bg-transparent px-1.5 py-1 shadow-none focus-visible:ring-transparent"
          placeholder="Text to display"
          data-editor-keep-selection-visible
          onKeyDown={onInputKeyDown}
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
  const attributes = useEditorSelector(
    (innerEditor) => {
      const link = innerEditor.read.nodes.find({ type: linkPlugin })?.[0];

      return link ? innerEditor.plugin(linkPlugin).api.getAttributes(link) : {};
    },
    {
      equalityFn: sameAttributes,
      shouldUpdate: (change) =>
        !change || change.selectionChanged || change.changed.hasAny('document'),
    }
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
