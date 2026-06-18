import isUrl from 'is-url';
import type React from 'react';
import { type PointerEvent, useMemo } from 'react';
import {
  defineEditorExtension,
  type EditorUpdateTransaction,
  NodeApi,
  RangeApi,
} from '@platejs/slate';
import { isHotkey } from '@platejs/slate-dom';
import * as SlateReact from '@platejs/slate-react';
import {
  Editable,
  type RenderElementProps,
  type RenderTextProps,
  useEditor,
  useEditorSelector,
  useElementSelected,
  useSlateEditor,
} from '@platejs/slate-react';

import { cn } from '@/utils/cn';

import { Button, Icon, Toolbar } from './components';
import type {
  BadgeElement,
  ButtonElement,
  CustomEditor,
  CustomElement,
  LinkElement,
  ParagraphElement,
} from './custom-types.d';

const InlinesExample = () => {
  const editor = useSlateEditor({
    extensions: [inline()],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'In addition to block nodes, you can create inline nodes. Here is a ',
          },
          {
            type: 'link',
            url: 'https://en.wikipedia.org/wiki/Hypertext',
            children: [{ text: 'hyperlink' }],
          },
          {
            text: ', and here is a more unusual inline: an ',
          },
          {
            type: 'button',
            children: [{ text: 'editable button' }],
          },
          {
            text: '! Here is a read-only inline: ',
          },
          {
            type: 'badge',
            children: [{ text: 'Approved' }],
          },
          {
            text: '.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'There are two ways to add links. You can either add a link via the toolbar icon above, or if you want in on a little secret, copy a URL to your clipboard and paste it while a range of text is selected. ',
          },
          // The following is an example of an inline at the end of a block.
          // This is an edge case that can cause issues.
          {
            type: 'link',
            url: 'https://twitter.com/JustMissEmma/status/1448679899531726852',
            children: [{ text: 'Finally, here is our favorite dog video.' }],
          },
          { text: '' },
        ],
      },
    ],
  });
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = editor.read((state) => state.selection.get());

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    if (selection && RangeApi.isCollapsed(selection)) {
      if (isHotkey('left', event)) {
        editor.update((tx) => {
          tx.selection.move({ unit: 'offset', reverse: true });
        });
        return true;
      }
      if (isHotkey('right', event)) {
        editor.update((tx) => {
          tx.selection.move({ unit: 'offset' });
        });
        return true;
      }
    }
  };

  return (
    <SlateReact.Slate editor={editor}>
      <Toolbar>
        <AddLinkButton />
        <RemoveLinkButton />
        <ToggleEditableButtonButton />
      </Toolbar>
      <Editable
        onKeyDown={onKeyDown}
        placeholder="Enter some text..."
        renderElement={renderElement}
        renderText={InlineText}
      />
    </SlateReact.Slate>
  );
};

const inline = () =>
  defineEditorExtension<CustomEditor>()({
    clipboard: {
      insertData(data, { editor, next }) {
        const text = data.getData('text/plain');

        if (text && isUrl(text)) {
          wrapLink(editor, text);
          return true;
        }
        return next();
      },
    },
    name: 'inline',
    transforms: {
      insertText({ next, text, tx }) {
        if (isUrl(text)) {
          insertLinkText(tx, text);

          return true;
        }

        if (insertLinkedTextSegments(tx, text)) {
          return true;
        }

        return next();
      },
    },
    elements: [
      { inline: true, type: 'link' },
      { inline: true, type: 'button' },
      { inline: true, readOnly: true, selectable: false, type: 'badge' },
    ],
  });

const URL_TEXT_PATTERN = /https?:\/\/[^\s]+/gi;

const trimUrlPunctuation = (text: string) => {
  const suffix = text.match(/[.,!?;:]+$/)?.[0] ?? '';

  if (!suffix) {
    return { suffix: '', url: text };
  }

  return {
    suffix,
    url: text.slice(0, -suffix.length),
  };
};

const splitLinkedTextSegments = (text: string) => {
  const segments: Array<{ text: string; url?: true }> = [];
  let cursor = 0;

  for (const match of text.matchAll(URL_TEXT_PATTERN)) {
    const raw = match[0];
    const index = match.index ?? 0;
    const { suffix, url } = trimUrlPunctuation(raw);

    if (!url || !isUrl(url)) {
      continue;
    }

    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index) });
    }

    segments.push({ text: url, url: true });

    if (suffix) {
      segments.push({ text: suffix });
    }

    cursor = index + raw.length;
  }

  if (segments.length === 0) {
    return null;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments;
};

const insertLinkText = (
  tx: EditorUpdateTransaction<CustomElement[]>,
  url: string
) => {
  if (
    tx.nodes.some({
      match: (n) => NodeApi.isElement(n) && n.type === 'link',
    })
  ) {
    tx.nodes.unwrap({
      match: (n) => NodeApi.isElement(n) && n.type === 'link',
    });
  }

  const selection = tx.selection.get();
  const isCollapsed = selection && RangeApi.isCollapsed(selection);
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    tx.nodes.insert(link);
    tx.selection.move({ unit: 'offset' });
  } else {
    tx.nodes.wrap(link, { split: true });
    tx.selection.collapse({ edge: 'end' });
    tx.selection.move({ unit: 'offset' });
  }
};

const insertLinkedTextSegments = (
  tx: EditorUpdateTransaction<CustomElement[]>,
  text: string
) => {
  const selection = tx.selection.get();

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return false;
  }

  const segments = splitLinkedTextSegments(text);

  if (!segments) {
    return false;
  }

  for (const segment of segments) {
    if (segment.url) {
      insertLinkText(tx, segment.text);
    } else {
      tx.text.insert(segment.text);
    }
  }

  return true;
};

const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case 'badge':
      return (
        <BadgeComponent {...(props as RenderElementProps<BadgeElement>)} />
      );
    case 'button':
      return (
        <EditableButtonComponent
          {...(props as RenderElementProps<ButtonElement>)}
        />
      );
    case 'link':
      return <LinkComponent {...(props as RenderElementProps<LinkElement>)} />;
    case 'paragraph':
      return (
        <ParagraphComponent
          {...(props as RenderElementProps<ParagraphElement>)}
        />
      );
  }
};

const isLinkActive = (editor: CustomEditor): boolean =>
  editor.read((state) =>
    state.nodes.some({
      match: (n) => NodeApi.isElement(n) && n.type === 'link',
    })
  );

const isButtonActive = (editor: CustomEditor): boolean =>
  editor.read((state) =>
    state.nodes.some({
      match: (n) => NodeApi.isElement(n) && n.type === 'button',
    })
  );

const unwrapLink = (editor: CustomEditor) => {
  editor.update((tx) => {
    tx.nodes.unwrap({
      match: (n) => NodeApi.isElement(n) && n.type === 'link',
    });
  });
};

const unwrapButton = (editor: CustomEditor) => {
  editor.update((tx) => {
    tx.nodes.unwrap({
      match: (n) => NodeApi.isElement(n) && n.type === 'button',
    });
  });
};

const wrapLink = (editor: CustomEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const selection = editor.read((state) => state.selection.get());
  const isCollapsed = selection && RangeApi.isCollapsed(selection);
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  editor.update((tx) => {
    if (isCollapsed) {
      tx.nodes.insert(link);
      tx.selection.move({ unit: 'offset' });
    } else {
      tx.nodes.wrap(link, { split: true });
    }
  });

  return true;
};

const wrapButton = (editor: CustomEditor) => {
  if (isButtonActive(editor)) {
    unwrapButton(editor);
  }

  const selection = editor.read((state) => state.selection.get());
  const isCollapsed = selection && RangeApi.isCollapsed(selection);
  const button: ButtonElement = {
    type: 'button',
    children: isCollapsed ? [{ text: 'Edit me!' }] : [],
  };

  editor.update((tx) => {
    if (isCollapsed) {
      tx.nodes.insert(button);
    } else {
      tx.nodes.wrap(button, { split: true });
      tx.selection.collapse({ edge: 'end' });
    }
  });
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  <span className="slate-inlines-chromium-bugfix" contentEditable={false}>
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];

const LinkComponent = ({
  attributes,
  children,
  element,
}: RenderElementProps<LinkElement>) => {
  const selected = useElementSelected();
  const safeUrl = useMemo(() => {
    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(element.url);
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return 'about:blank';
  }, [element.url]);

  return (
    <a
      {...attributes}
      className={cn(selected && 'slate-inlines-link-selected')}
      href={safeUrl}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};

const EditableButtonComponent = ({
  attributes,
  children,
}: RenderElementProps<ButtonElement>) => {
  return (
    /*
      This is a span with button-like CSS rather than a native button.
      Chrome and Safari handle display:inline-block poorly inside
      contenteditable, and CSS cannot override the native button display:
      - https://bugs.webkit.org/show_bug.cgi?id=105898
      - https://bugs.chromium.org/p/chromium/issues/detail?id=1088403
      - https://github.com/w3c/csswg-drafts/issues/3226
    */
    <span
      {...attributes}
      // Margin is necessary to clearly show the cursor adjacent to the button
      className="slate-inlines-editable-button"
      onClick={(ev) => ev.preventDefault()}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </span>
  );
};

const BadgeComponent = ({
  attributes,
  children,
}: RenderElementProps<BadgeElement>) => {
  const selected = useElementSelected();

  return (
    <span
      {...attributes}
      className={cn('slate-inlines-badge', selected && 'is-selected')}
      contentEditable={false}
      data-playwright-selected={selected}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </span>
  );
};

const ParagraphComponent = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElement>) => <p {...attributes}>{children}</p>;

const InlineText = (props: RenderTextProps) => {
  const { attributes, children, text } = props;
  return (
    <span
      // Keeps end-of-block clicks outside the trailing inline in Chromium.
      // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
      className={cn(text.text === '' && 'slate-inlines-empty-text')}
      {...attributes}
    >
      {children}
    </span>
  );
};

const AddLinkButton = () => {
  const editor = useEditor<CustomEditor>();
  const active = useEditorSelector((editor: CustomEditor) =>
    isLinkActive(editor)
  );
  return (
    <Button
      active={active}
      onClick={() => {
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;

        if (editor.read((state) => state.selection.get())) {
          wrapLink(editor, url);
        }
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
    >
      <Icon>link</Icon>
    </Button>
  );
};

const RemoveLinkButton = () => {
  const editor = useEditor<CustomEditor>();
  const active = useEditorSelector((editor: CustomEditor) =>
    isLinkActive(editor)
  );

  return (
    <Button
      active={active}
      onClick={() => {
        if (isLinkActive(editor)) {
          unwrapLink(editor);
        }
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
    >
      <Icon>link_off</Icon>
    </Button>
  );
};

const ToggleEditableButtonButton = () => {
  const editor = useEditor<CustomEditor>();
  return (
    <Button
      active
      onClick={() => {
        if (isButtonActive(editor)) {
          unwrapButton(editor);
        } else if (editor.read((state) => state.selection.get())) {
          wrapButton(editor);
        }
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
    >
      <Icon>smart_button</Icon>
    </Button>
  );
};

export default InlinesExample;
