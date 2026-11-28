'use client';

import {
  flip,
  offset,
  shift,
  useDismiss,
  useInteractions,
} from '@floating-ui/react';
import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import {
  Check,
  Copy,
  ExternalLink,
  Link,
  Pencil,
  Text,
  Unlink,
} from 'lucide-react';
import {
  getLinkHref,
  LinkRules,
  NodeApi,
  type NodeKey,
  type Path,
  SelectionApi,
} from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import { BaseLockPlugin } from 'platejs/lock';
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
  const readOnly = useEditorReadOnly();
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
        'font-medium text-primary underline underline-offset-4',
        inlineSuggestionVariants()
      )}
      attributes={{
        ...props.attributes,
        ...attributes,
        // A plain click places the caret; Mod+click follows the link.
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          if (
            readOnly ||
            !(event.metaKey || event.ctrlKey) ||
            event.button !== 0 ||
            !attributes.href
          ) {
            return;
          }

          event.preventDefault();
          window.open(attributes.href, '_blank', 'noopener,noreferrer');
        },
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

type FloatingLinkState =
  | { kind: 'closed' }
  | { editorId: string; kind: 'view' }
  | {
      editorId: string;
      error: string | null;
      initialTarget: string | undefined;
      initialText: string;
      initialUrl: string;
      kind: 'form';
      linkKey: NodeKey | null;
      linkRoot: string | undefined;
      mode: 'edit' | 'insert';
      newTab: boolean;
      newTabDirty: boolean;
      openId: number;
      text: string;
      url: string;
      urlDirty: boolean;
    };

let nextFormOpenId = 0;

const initialLinkState: { ui: FloatingLinkState } = { ui: { kind: 'closed' } };

const INVALID_LINK = 'Enter a valid link, such as example.com.';
const REFUSED_LINK = 'This link type is not allowed.';
const LOCKED_LINK = 'This link can no longer be edited.';

const DRAFT_SCHEME = /^([a-z][a-z\d+.-]*):/iu;
const DRAFT_HIERARCHICAL = /^[a-z][a-z\d+.-]*:\/\//iu;
const DRAFT_RELATIVE = /^(?:[#/?]|\.{1,2}\/)/u;
const DRAFT_WEB_WITHOUT_SLASHES = /^https?:(?!\/\/)/iu;
const DRAFT_EMAIL = /^[^\s#/:?@]+@[^\s#/:?@]+\.[^\s#/:?@]+$/u;
const DRAFT_LOCALHOST = /^localhost(?::\d{1,5})?(?:[#/?]\S*)?$/iu;
const DRAFT_HOST =
  /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+(?:\p{L}{2,}|xn--[a-z\d-]+))(?::\d{1,5})?(?:[#/?]\S*)?$/iu;
// Script-capable schemes stay as typed so the link policy refuses them with
// an error instead of the form reading them as a host name.
const FLOOR_SCHEMES = new Set([
  'blob',
  'data',
  'filesystem',
  'javascript',
  'vbscript',
]);

// Turns what a person typed into the URL to store, or the reason it is not a
// link. Order matters: an address with a scheme is never read as a host.
const classifyLinkDraft = (
  value: string,
  allowedSchemes: readonly string[]
): { error: string; url?: never } | { error?: never; url: string } => {
  const draft = value.trim();

  if (draft === '') return { error: 'Enter a link.' };
  if (
    draft.startsWith('//') ||
    /\s/u.test(draft) ||
    DRAFT_WEB_WITHOUT_SLASHES.test(draft)
  ) {
    return { error: INVALID_LINK };
  }
  if (DRAFT_RELATIVE.test(draft)) return { url: draft };

  const scheme = DRAFT_SCHEME.exec(draft)?.[1]?.toLowerCase();

  if (
    DRAFT_HIERARCHICAL.test(draft) ||
    (scheme !== undefined &&
      (FLOOR_SCHEMES.has(scheme) ||
        allowedSchemes.some((allowed) => allowed.toLowerCase() === scheme)))
  ) {
    return { url: draft };
  }
  if (DRAFT_EMAIL.test(draft)) return { url: `mailto:${draft}` };
  if (DRAFT_LOCALHOST.test(draft)) return { url: `http://${draft}` };
  if (DRAFT_HOST.test(draft)) return { url: `https://${draft}` };

  return { error: INVALID_LINK };
};

const decodeLinkUrl = (url: string) => {
  try {
    return decodeURI(url);
  } catch (error) {
    if (error instanceof URIError) return url;
    throw error;
  }
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
} satisfies UseFloatingRectOptions;

export const linkPlugin = LinkPlugin.extend({
  initialState: initialLinkState,
})
  .extend({
    api: ({ editor, store }) => ({
      /**
       * Whether the link at `at` takes edits: its block is not locked and, in
       * a reviewed document, the link outlives its pending changes.
       */
      canEditLink: (at: Path, root?: string) => {
        const rootedPoint = root
          ? { offset: 0, path: [...at, 0], root }
          : undefined;
        const lock = editor.plugin(BaseLockPlugin);

        if (lock.installed && lock.read.isLocked(rootedPoint ?? at)) {
          return false;
        }

        const authored = editor.plugin(AuthoredPlugin);

        if (!authored.installed) return true;

        const link = rootedPoint
          ? editor.read.nodes.above({ at: rootedPoint, type: LinkPlugin })?.[0]
          : editor.read.nodes.get(at, { type: LinkPlugin })?.[0];

        if (!link) return false;

        const { reviewOf } = authored.read;
        const linkReview = reviewOf(link);

        if (
          linkReview.hidden ||
          linkReview.marks.some(
            ({ kind }) => kind === 'delete' || kind === 'unwrap'
          ) ||
          link.children.every((child) => {
            const review = reviewOf(child);

            return (
              review.hidden ||
              review.marks.some(({ kind }) => kind === 'delete')
            );
          })
        ) {
          return false;
        }

        for (let depth = at.length - 1; depth > 0; depth -= 1) {
          const ancestor = rootedPoint
            ? editor.read.nodes.above({
                at: rootedPoint,
                match: (_node, path) => path.length === depth,
              })?.[0]
            : editor.read.nodes.get(at.slice(0, depth))?.[0];
          const review = ancestor ? reviewOf(ancestor) : undefined;

          if (
            review &&
            (review.hidden ||
              review.marks.some(({ kind }) => kind === 'delete'))
          ) {
            return false;
          }
        }

        return true;
      },
      /** Closes the form, back to the link actions when the caret is in a link. */
      closeForm: () => {
        const ui = store.get('ui');

        if (ui.kind !== 'form') return false;

        const selection = editor.read.selection();
        const inLink =
          !!selection &&
          editor.read.selection.isCollapsed() &&
          !!editor.read.nodes.above({ at: selection, type: LinkPlugin });

        store.set({
          ui: inLink
            ? { editorId: ui.editorId, kind: 'view' }
            : { kind: 'closed' },
        });

        return true;
      },
      decodeUrl: decodeLinkUrl,
      hide: () => {
        store.set({ ui: { kind: 'closed' } });
      },
    }),
  })
  .extend({
    api: ({ api, editor, store, update }) => ({
      submit: () => {
        const ui = store.get('ui');

        if (ui.kind !== 'form' || editor.read.view.isReadOnly()) {
          return undefined;
        }

        // Saves the draft and returns why it could not, or null once saved.
        const save = () => {
          if (ui.mode === 'insert') {
            const draft = classifyLinkDraft(
              ui.url,
              store.get('allowedSchemes')
            );

            if (draft.url === undefined) return draft.error;

            const selection = editor.read.selection();
            const lock = editor.plugin(BaseLockPlugin);

            if (
              !selection ||
              (lock.installed && lock.read.isLocked(selection))
            ) {
              return LOCKED_LINK;
            }

            return update.upsert({
              text: ui.text,
              url: draft.url,
              ...(ui.newTab ? { target: '_blank' } : {}),
            })
              ? null
              : REFUSED_LINK;
          }

          // The link the form opened on, wherever the selection went since.
          const entry =
            ui.linkKey === null
              ? undefined
              : editor.read.nodes.get(ui.linkKey, { type: linkPlugin });

          if (!entry || !api.canEditLink(entry[1], ui.linkRoot)) {
            return LOCKED_LINK;
          }

          const [liveLink, path] = entry;
          const targetAt = ui.linkRoot
            ? { offset: 0, path: [...path, 0], root: ui.linkRoot }
            : path;

          // A stored link the policy would refuse today still takes a new
          // label or target, as long as its address is left alone.
          const isUneditedUrl =
            !ui.urlDirty ||
            ui.url === liveLink.url ||
            ui.url === api.decodeUrl(liveLink.url);
          const draft = isUneditedUrl
            ? { url: liveLink.url }
            : classifyLinkDraft(ui.url, store.get('allowedSchemes'));

          if (draft.url === undefined) return draft.error;

          // An unchanged link saves nothing, which is not a refusal.
          const urlMatchesLive = draft.url === liveLink.url;
          const saved = update.upsert({
            at: targetAt,
            text: ui.text,
            url: draft.url,
            ...(ui.newTabDirty ? { target: ui.newTab ? '_blank' : null } : {}),
          });

          return saved || urlMatchesLive ? null : REFUSED_LINK;
        };
        const error = save();

        if (error !== null) {
          store.set({ ui: { ...ui, error } });

          return undefined;
        }

        api.closeForm();
        // Focus in the same task as the tap so a phone keeps its keyboard up.
        editor.api.dom.focus();

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
        const linkRoot = SelectionApi.root(selection);

        if (!api.canEditLink(path, linkRoot)) return false;

        const linkText = NodeApi.string(link);
        const initialText = linkText === link.url ? '' : linkText;

        nextFormOpenId += 1;
        store.set({
          ui: {
            editorId: editor.id,
            error: null,
            initialTarget: link.target,
            initialText,
            initialUrl: link.url,
            kind: 'form',
            linkKey: editor.key(link),
            linkRoot,
            mode: 'edit',
            newTab: link.target === '_blank',
            newTabDirty: false,
            openId: nextFormOpenId,
            text: initialText,
            url: link.url,
            urlDirty: false,
          },
        });

        return true;
      },
      triggerInsert: ({ focused }: { focused?: boolean } = {}) => {
        if (!focused || store.get('ui').kind === 'form') return undefined;
        if (editor.read.selection.isAcrossBlocks()) return undefined;

        const selection = editor.read.selection();

        if (!selection) return undefined;

        const lock = editor.plugin(BaseLockPlugin);

        if (lock.installed && lock.read.isLocked(selection)) return undefined;
        // A selection that already holds links still opens Insert link: the
        // saved link replaces them in one step.
        if (
          !editor.read.schema.canWrap(
            {
              children: [{ text: '' }],
              type: editor.plugin(LinkPlugin).schema.type,
              url: 'https://example.com',
            },
            { replace: true, split: true }
          )
        ) {
          return undefined;
        }

        const initialText = editor.read.text.string();

        nextFormOpenId += 1;
        store.set({
          ui: {
            editorId: editor.id,
            error: null,
            initialTarget: undefined,
            initialText,
            initialUrl: '',
            kind: 'form',
            linkKey: null,
            linkRoot: undefined,
            mode: 'insert',
            newTab: false,
            newTabDirty: false,
            openId: nextFormOpenId,
            text: initialText,
            url: '',
            urlDirty: false,
          },
        });

        return true;
      },
      unlink: () => {
        const selection = editor.read.selection();
        const entry =
          selection &&
          editor.read.nodes.above({ at: selection, type: linkPlugin });

        if (!entry || editor.read.view.isReadOnly()) {
          return undefined;
        }

        const linkRoot = SelectionApi.root(selection);

        if (!api.canEditLink(entry[1], linkRoot)) {
          return undefined;
        }

        update.unwrap({
          at: linkRoot
            ? { offset: 0, path: [...entry[1], 0], root: linkRoot }
            : entry[1],
        });
        api.hide();
        editor.api.dom.focus();

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
          if (store.get('ui').kind === 'closed') return false;
          api.hide();
          return true;
        },
      },
      trigger: { keys: 'mod+k' },
    },
  }));

const preventFocusLoss = (event: React.MouseEvent) => {
  event.preventDefault();
};

function FloatingLinkInput({
  field,
  ...props
}: React.ComponentPropsWithRef<'input'> & { field: 'text' | 'url' }) {
  const { store } = useEditor().plugin(linkPlugin);

  return (
    <Input
      className="h-7 border-none bg-transparent px-1.5 py-1 shadow-none focus-visible:ring-transparent aria-invalid:ring-0"
      data-editor-keep-selection-visible
      onChange={(event) => {
        const ui = store.get('ui');

        if (ui.kind !== 'form') return;

        store.set({
          ui:
            field === 'url'
              ? { ...ui, error: null, url: event.target.value, urlDirty: true }
              : { ...ui, text: event.target.value },
        });
      }}
      {...props}
    />
  );
}

export function LinkFloatingToolbar({ editableRef }: EditableSiblingProps) {
  const editor = useEditor();
  const { api, store } = editor.plugin(linkPlugin);
  const readOnly = useEditorReadOnly();
  const ui = usePluginStore(linkPlugin, 'ui');
  const selectedLink = useEditorSelector(
    (innerEditor) => {
      const selection = innerEditor.read.selection();

      if (!selection || !innerEditor.read.selection.isCollapsed()) return null;

      const entry = innerEditor.read.nodes.above({
        at: selection,
        type: linkPlugin,
      });

      if (!entry) return null;

      return {
        editable: innerEditor
          .plugin(linkPlugin)
          .api.canEditLink(entry[1], SelectionApi.root(selection)),
        key: innerEditor.key(entry[0]),
        url: entry[0].url,
      };
    },
    {
      dependsOn: ['selection', 'document'],
      equalityFn: (left, right) =>
        left === right ||
        (left !== null &&
          right !== null &&
          left.editable === right.editable &&
          left.key === right.key &&
          left.url === right.url),
    }
  );
  const selectedLinkKey = selectedLink?.key ?? null;
  const geometry = useSelectionGeometry({ editableRef });
  const ownUi = ui.kind !== 'closed' && ui.editorId === editor.id;
  const formOpen = ownUi && ui.kind === 'form';
  const open =
    !readOnly && ownUi && (ui.kind === 'form' || selectedLinkKey !== null);
  const floating = useFloatingRect(geometry, {
    hideWhenClipped: !formOpen,
    onOpenChange: (nextOpen, _event, reason) => {
      if (nextOpen) return;

      const current = store.get('ui');

      if (current.kind === 'form' && current.mode === 'insert') {
        api.hide();
        if (reason !== 'outside-press') editor.api.dom.focus();
        return;
      }

      api.closeForm();
    },
    open,
    ...linkFloatingOptions,
  });
  const dismiss = useDismiss(floating.context, { escapeKey: false });
  const { getFloatingProps } = useInteractions([dismiss]);
  const floatingRef = useComposedRef(floating.refs.setFloating);
  const floatingElement = floating.elements.floating;

  React.useEffect(() => {
    const current = store.get('ui');

    if (readOnly) {
      if (current.kind !== 'closed' && current.editorId === editor.id) {
        api.hide();
      }

      return;
    }
    if (selectedLinkKey !== null) {
      if (current.kind === 'closed') {
        store.set({ ui: { editorId: editor.id, kind: 'view' } });
      }

      return;
    }
    if (current.kind === 'view') api.hide();
  }, [api, editor, readOnly, selectedLinkKey, store]);

  React.useEffect(() => {
    const ownerDocument = floatingElement?.ownerDocument;
    const view = ownerDocument?.defaultView;

    if (!ownerDocument || !view) return undefined;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const onBlur = () => {
      globalThis.clearTimeout(timeout);
      // Iframe focus does not dispatch an outside pointer event in this document.
      timeout = globalThis.setTimeout(() => {
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
      globalThis.clearTimeout(timeout);
    };
  }, [api, floatingElement]);

  if (!open) return null;

  return (
    <div
      ref={floatingRef}
      className={cn(popoverVariants(), formOpen && 'p-0')}
      {...getFloatingProps({
        onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
          const focusLeftForm =
            event.relatedTarget !== null &&
            !event.currentTarget.contains(event.relatedTarget);

          if (focusLeftForm) api.closeForm();
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
          event.preventDefault();
          event.stopPropagation();
          if (!api.closeForm()) api.hide();
          editor.api.dom.focus();
        },
        style: { ...floating.style, zIndex: 50 },
      })}
    >
      {ui.kind === 'form' ? (
        <LinkForm key={ui.openId} shown={floating.shown && !!geometry} />
      ) : (
        selectedLink && (
          <LinkActions
            key={selectedLink.key}
            editable={selectedLink.editable}
            url={selectedLink.url}
          />
        )
      )}
    </div>
  );
}

function LinkActions({ editable, url }: { editable: boolean; url: string }) {
  const { api } = useEditor().plugin(linkPlugin);
  const allowedSchemes = usePluginStore(linkPlugin, 'allowedSchemes');
  const [copied, setCopied] = React.useState(false);
  const href = getLinkHref(url, { allowedSchemes });
  const shownUrl = decodeLinkUrl(url);

  React.useEffect(() => {
    if (!copied) return undefined;

    const timeout = globalThis.setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [copied]);

  return (
    <div className="box-content flex max-w-[calc(100vw-16px)] items-center gap-0.5">
      {href === undefined ? (
        <span
          className="max-w-[240px] truncate px-2 text-sm text-muted-foreground"
          title={shownUrl}
        >
          {shownUrl}
        </span>
      ) : (
        <a
          className={cn(
            buttonVariants({ size: 'sm', variant: 'ghost' }),
            'min-w-0 max-w-[240px] justify-start font-normal'
          )}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
          title={shownUrl}
          onFocus={(event) => {
            event.stopPropagation();
          }}
          onMouseOver={(event) => {
            event.stopPropagation();
          }}
        >
          <ExternalLink />
          <span className="sr-only">Open link in a new tab: </span>
          <span className="truncate">{shownUrl}</span>
        </a>
      )}

      <Separator className="mx-0.5 h-5" orientation="vertical" />

      <Button
        aria-label="Copy link"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={() => {
          void navigator.clipboard?.writeText(url).then(
            () => {
              setCopied(true);
            },
            () => {
              setCopied(false);
            }
          );
        }}
        onMouseDown={preventFocusLoss}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
      <span className="sr-only" role="status">
        {copied ? 'Link copied' : ''}
      </span>

      {editable && (
        <>
          <Button
            aria-label="Edit link"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => {
              api.triggerEdit();
            }}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            aria-label="Remove link"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={() => {
              api.unlink();
            }}
            onMouseDown={preventFocusLoss}
          >
            <Unlink />
          </Button>
        </>
      )}
    </div>
  );
}

function LinkForm({ shown }: { shown: boolean }) {
  const { api, store } = useEditor().plugin(linkPlugin);
  const ui = usePluginStore(linkPlugin, 'ui');
  const errorId = React.useId();
  const urlInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (shown) urlInputRef.current?.focus({ preventScroll: true });
  }, [shown]);

  if (ui.kind !== 'form') return null;

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key !== 'Enter' ||
      event.nativeEvent.isComposing ||
      // oxlint-disable-next-line typescript/no-deprecated -- Safari sends the Enter that confirms an input method candidate after compositionend, with only key code 229 to tell it apart.
      event.keyCode === 229
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    api.submit();
  };

  return (
    <div className="flex w-[330px] max-w-[calc(100vw-16px)] flex-col">
      <div className="flex items-center">
        <div
          className={cn(
            'flex items-center ps-2 pe-1 text-muted-foreground',
            ui.error && 'text-destructive'
          )}
        >
          <Link className="size-4" />
        </div>

        <FloatingLinkInput
          ref={urlInputRef}
          aria-describedby={ui.error ? errorId : undefined}
          aria-invalid={Boolean(ui.error)}
          aria-label="Link"
          autoCapitalize="none"
          autoCorrect="off"
          defaultValue={decodeLinkUrl(ui.initialUrl)}
          enterKeyHint="go"
          field="url"
          inputMode="url"
          placeholder="Paste link"
          spellCheck={false}
          onKeyDown={onInputKeyDown}
        />
      </div>
      {ui.error && (
        <p
          className="px-2 pb-1 text-xs text-destructive"
          id={errorId}
          role="alert"
        >
          {ui.error}
        </p>
      )}
      <Separator className="my-1" />
      <div className="flex items-center">
        <div className="flex items-center ps-2 pe-1 text-muted-foreground">
          <Text className="size-4" />
        </div>
        <FloatingLinkInput
          aria-label="Text to display"
          defaultValue={ui.initialText}
          enterKeyHint="go"
          field="text"
          placeholder="Text to display"
          onKeyDown={onInputKeyDown}
        />
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-2 py-1">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <input
            checked={ui.newTab}
            className="size-3.5 accent-primary"
            type="checkbox"
            onChange={(event) => {
              const current = store.get('ui');

              if (current.kind !== 'form') return;

              store.set({
                ui: {
                  ...current,
                  newTab: event.target.checked,
                  newTabDirty: true,
                },
              });
            }}
          />
          Open in new tab
        </label>
        <Button
          size="xs"
          type="button"
          onClick={() => {
            api.submit();
          }}
          onMouseDown={preventFocusLoss}
        >
          Apply
        </Button>
      </div>
    </div>
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
      caret: LinkFloatingToolbar,
    },
  }),
] as const;
