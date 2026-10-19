import { expect, test } from 'bun:test';

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  BaseBlockquotePlugin,
  BaseCodeBlockPlugin,
  BaseHeadingPlugin,
  definePlugin,
  schema,
  type Value,
} from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { AuthoredPlugin } from 'platejs/authored';
import { BaseDetailsPlugin, BaseDetailsSummaryPlugin } from 'platejs/details';
import {
  createEditor,
  type Editor,
  EditorContent,
  EditorRoot,
  ParagraphPlugin,
  useEditor,
} from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import React from 'react';
import { flushSync } from 'react-dom';

import { SlashKit, SlashPlugin } from './slash';

test('allows the slash trigger when Code Block is not installed', () => {
  const editor = createEditor({
    plugins: [ParagraphPlugin, ...SlashKit],
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
  });

  const { triggerQuery } = editor.plugin(SlashPlugin).store.get();

  expect(triggerQuery?.(editor)).toBe(true);
});

test.each(['', 'After'])(
  'opens AI with Enter and consumes only the query before %j',
  async (remainingText) => {
    let viewEditor: Editor | undefined;
    const CaptureEditor = () => {
      viewEditor = useEditor();

      return null;
    };
    const editor = createEditor({
      plugins: [
        ParagraphPlugin,
        BaseCodeBlockPlugin,
        AuthoredPlugin,
        AIChatPlugin,
        SuggestionPlugin,
        ...SlashKit,
      ],
      userId: 'alice',
      initialValue: [
        { children: [{ text: `Before ${remainingText}` }], type: 'paragraph' },
        { children: [{ text: 'Next block' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      },
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <EditorContent data-testid="editor" />
        <CaptureEditor />
      </EditorRoot>
    );
    const root = mounted.getByTestId('editor');

    await act(async () => {
      root.focus();
      viewEditor!.plugin(SuggestionPlugin).api.setMode('suggesting');
      viewEditor!.update.nodes.split({
        always: true,
        at: { offset: 7, path: [0, 0] },
        match: (node) => 'children' in node,
      });
      viewEditor!.update.selection.set({ offset: 0, path: [1, 0] });
    });

    for (const data of '/a') {
      await act(async () => {
        root.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            data,
            inputType: 'insertText',
          })
        );
      });
    }

    await screen.findByRole('option', { name: 'AI' });
    fireEvent.keyDown(root, { code: 'Enter', key: 'Enter' });

    await waitFor(() => {
      expect(viewEditor!.plugin(AIChatPlugin).store.get('open')).toBe(true);
      expect(viewEditor!.read.text.string([1])).toBe(remainingText);
    });
  }
);

test('keeps AI closed when the view turns read-only while its completion commits', async () => {
  let viewEditor: Editor | undefined;
  let armed = false;
  const CaptureEditor = () => {
    viewEditor = useEditor();

    return null;
  };
  const editor = createEditor({
    plugins: [ParagraphPlugin, AIChatPlugin, ...SlashKit],
    initialValue: [{ children: [{ text: 'Before ' }], type: 'paragraph' }],
    selection: {
      kind: 'text',
      anchor: { offset: 7, path: [0, 0] },
      focus: { offset: 7, path: [0, 0] },
    },
  });
  const Shell = () => {
    const [readOnly, setReadOnly] = React.useState(false);

    return (
      <EditorRoot
        editor={editor}
        readOnly={readOnly}
        onValueChange={() => {
          if (armed) flushSync(() => setReadOnly(true));
        }}
      >
        <EditorContent data-testid="editor" />
        <CaptureEditor />
      </EditorRoot>
    );
  };
  const mounted = render(<Shell />);
  const root = mounted.getByTestId('editor');

  await act(async () => {
    root.focus();
  });

  for (const data of '/a') {
    await act(async () => {
      root.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data,
          inputType: 'insertText',
        })
      );
    });
  }

  await screen.findByRole('option', { name: 'AI' });
  armed = true;
  await act(async () => {
    fireEvent.keyDown(root, { code: 'Enter', key: 'Enter' });
  });

  expect(viewEditor!.read.view.isReadOnly()).toBe(true);
  expect(viewEditor!.read.text.string([0])).toBe('Before ');
  expect(viewEditor!.plugin(AIChatPlugin).store.get('open')).toBe(false);
  mounted.unmount();
});

test('keeps a slash typed in a code block as text', async () => {
  let viewEditor: Editor | undefined;
  const CaptureEditor = () => {
    viewEditor = useEditor();

    return null;
  };
  const editor = createEditor({
    plugins: [ParagraphPlugin, BaseCodeBlockPlugin, ...SlashKit],
    initialValue: [{ children: [{ text: 'let ' }], type: 'codeBlock' }],
  });
  const mounted = render(
    <EditorRoot editor={editor}>
      <EditorContent data-testid="editor" />
      <CaptureEditor />
    </EditorRoot>
  );
  const root = mounted.getByTestId('editor');

  await act(async () => {
    root.focus();
    viewEditor!.update.selection.set({ offset: 4, path: [0, 0] });
  });

  for (const data of '/p') {
    await act(async () => {
      root.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data,
          inputType: 'insertText',
        })
      );
    });
  }

  await expect(
    screen.findByRole('option', { name: 'Text' }, { timeout: 300 })
  ).rejects.toThrow();
  expect(root.getAttribute('aria-expanded')).toBeNull();
  expect(viewEditor!.read.children()).toEqual([
    { children: [{ text: 'let /p' }], type: 'codeBlock' },
  ]);
  mounted.unmount();
});

const FullParentPlugin = definePlugin('fullParent', {
  schema: {
    element: {
      blockContent: true,
      content: schema.content.types(['blockquote', 'paragraph'], { max: 1 }),
    },
  },
});

const runSlash = async ({
  caret,
  fullParent = false,
  heading = true,
  initialValue,
  menuCloses = true,
  open = false,
  option,
  query,
}: {
  caret: { offset: number; path: number[] };
  fullParent?: boolean;
  heading?: boolean;
  initialValue: Value;
  menuCloses?: boolean;
  open?: boolean;
  option: string;
  query: string;
}) => {
  let viewEditor: Editor | undefined;
  const CaptureEditor = () => {
    viewEditor = useEditor();

    return null;
  };
  const editor = createEditor({
    plugins: [
      ParagraphPlugin,
      ...(heading ? [BaseHeadingPlugin] : []),
      BaseDetailsSummaryPlugin,
      BaseDetailsPlugin,
      BaseBlockquotePlugin,
      BaseCodeBlockPlugin,
      ...(fullParent ? [FullParentPlugin] : []),
      ...SlashKit,
    ],
    initialValue,
  });
  const mounted = render(
    <EditorRoot editor={editor}>
      <EditorContent data-testid="editor" />
      <CaptureEditor />
    </EditorRoot>
  );
  const root = mounted.getByTestId('editor');

  await act(async () => {
    root.focus();
    viewEditor!.update.selection.set(caret);
    if (open) {
      viewEditor!
        .plugin(BaseDetailsPlugin)
        .api.setOpen(viewEditor!.key([0])!, true);
    }
  });

  for (const data of `/${query}`) {
    await act(async () => {
      root.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data,
          inputType: 'insertText',
        })
      );
    });
  }

  await screen.findByRole('option', { name: option });
  fireEvent.keyDown(root, { code: 'Enter', key: 'Enter' });
  if (menuCloses) {
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: option })).toBeNull();
    });
  }
  mounted.unmount();

  return viewEditor!.read.children();
};

const closedDetails = (title: Record<string, unknown>): Value => [
  {
    children: [
      { children: [{ text: '' }], type: 'summary', ...title },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ],
    type: 'details',
  },
];

for (const [option, query, inserted] of [
  [
    'Blockquote',
    'quote',
    {
      type: 'blockquote',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
  ],
  ['Code Block', 'code', { type: 'codeBlock', children: [{ text: '' }] }],
] as const) {
  test.each(['', 'Title '])(
    `inserts ${option} after a closed Details with title %j`,
    async (text) => {
      const children = closedDetails({ children: [{ text }] });

      expect(
        await runSlash({
          caret: { offset: text.length, path: [0, 0, 0] },
          initialValue: children,
          option,
          query,
        })
      ).toEqual([...children, inserted]);
    }
  );
}

test('keeps block insertion inside an expanded Details', async () => {
  expect(
    await runSlash({
      caret: { offset: 6, path: [0, 0, 0] },
      initialValue: closedDetails({ children: [{ text: 'Title ' }] }),
      open: true,
      option: 'Blockquote',
      query: 'quote',
    })
  ).toEqual([
    {
      type: 'details',
      children: [
        { type: 'summary', children: [{ text: 'Title ' }] },
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        },
        { type: 'paragraph', children: [{ text: 'Body' }] },
      ],
    },
  ]);
});

test.each(['', 'Title '])(
  'formats a closed title %j with Heading 2 in place',
  async (text) => {
    const children = closedDetails({ children: [{ text }] });

    expect(
      await runSlash({
        caret: { offset: text.length, path: [0, 0, 0] },
        initialValue: children,
        option: 'Heading 2',
        query: 'h2',
      })
    ).toEqual(closedDetails({ children: [{ text }], level: 2 }));
  }
);

test('turns a leveled title into a plain title through Text without Heading', async () => {
  expect(
    await runSlash({
      caret: { offset: 6, path: [0, 0, 0] },
      heading: false,
      initialValue: closedDetails({ children: [{ text: 'Title ' }], level: 2 }),
      option: 'Text',
      query: 'paragraph',
    })
  ).toEqual(closedDetails({ children: [{ text: 'Title ' }] }));
});

test('inserts a paragraph after an H2 with text through Text', async () => {
  expect(
    await runSlash({
      caret: { offset: 5, path: [0, 0] },
      initialValue: [
        { children: [{ text: 'Head ' }], level: 2, type: 'heading' },
      ],
      option: 'Text',
      query: 'paragraph',
    })
  ).toEqual([
    { children: [{ text: 'Head ' }], level: 2, type: 'heading' },
    { children: [{ text: '' }], type: 'paragraph' },
  ]);
});

test('keeps the query when the chosen block does not fit its parent', async () => {
  const initialValue: Value = [
    {
      children: [{ children: [{ text: 'Only ' }], type: 'paragraph' }],
      type: 'fullParent',
    },
  ];

  expect(
    await runSlash({
      caret: { offset: 5, path: [0, 0, 0] },
      fullParent: true,
      initialValue,
      menuCloses: false,
      option: 'Blockquote',
      query: 'quote',
    })
  ).toEqual([
    {
      children: [{ children: [{ text: 'Only /quote' }], type: 'paragraph' }],
      type: 'fullParent',
    },
  ]);
});
