import assert from 'node:assert/strict';
import { it } from 'node:test';

import {
  BaseParagraphPlugin,
  createEditor,
  DebugPlugin,
  definePlugin,
  type RuntimePluginReference,
} from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import { BaseCommentsPlugin } from 'platejs/comments';
import { BaseSuggestionPlugin } from 'platejs/suggestion';
import { yjs } from 'platejs/yjs';
import { YjsPlugin } from 'platejs/yjs/react';
import * as Y from 'yjs';

const initialValue = [{ type: 'paragraph', children: [{ text: 'Base' }] }];

it('attributes proposals to the editor user', () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, AuthoredPlugin],
    initialValue,
    userId: 'alice',
  });
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
  });

  assert.deepEqual(
    editor.read.authored.changes().items.map(({ authorId }) => authorId),
    ['alice']
  );
});

for (const [retainHistory, status] of [
  [true, 'applied'],
  [false, 'unavailable'],
] as const) {
  it(`reverts an accepted edit only when configured to retain history (${retainHistory})`, () => {
    const editor = createEditor({
      plugins: [
        BaseSuggestionPlugin,
        AuthoredPlugin.configure({ initialState: { retainHistory } }),
      ],
      initialValue,
      userId: 'alice',
    });
    editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    const authored = editor.plugin(AuthoredPlugin);

    assert.equal(
      authored.update.revert({
        selection: authored.read.select({ authorId: 'alice' }),
      }).status,
      status
    );
  });
}

for (const userId of [undefined, '']) {
  it(`writes and proposes as the local user when the user ID is ${JSON.stringify(userId)}`, () => {
    const editor = createEditor({
      plugins: [BaseSuggestionPlugin],
      initialValue,
      userId,
    });
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 4 } });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert('?', { at: { path: [0, 0], offset: 0 } });
    });

    assert.deepEqual(
      {
        authors: [
          ...new Set(
            editor.read.authored.changes().items.map(({ authorId }) => authorId)
          ),
        ],
        text: editor.read.children()[0]?.children[0]?.text,
      },
      { authors: ['local'], text: 'Base!' }
    );
  });
}

it('rejects a user ID that authored changes cannot store', () => {
  assert.throws(
    () =>
      createEditor({
        plugins: [BaseSuggestionPlugin],
        initialValue,
        userId: 'ali\u0000ce',
      }),
    /userId/
  );
});

const collaboration = () => ({
  doc: new Y.Doc(),
  initialReady: true,
  rootName: 'authored-user',
  seed: true,
});

const yjsCompositions = {
  'a Yjs plugin': () => [YjsPlugin.create(collaboration())],
  'a Yjs plugin another plugin depends on': () => [
    definePlugin('room', { dependencies: [YjsPlugin.create(collaboration())] }),
  ],
} as const;

const countUserWarnings = (
  plugins: readonly RuntimePluginReference[],
  {
    install,
    suggestions = true,
    userId,
    writes = 2,
  }: {
    install?: boolean;
    suggestions?: boolean;
    userId?: string;
    writes?: number;
  } = {}
) => {
  const warnings: string[] = [];
  const editor = createEditor({
    plugins: [
      ...(suggestions ? [BaseSuggestionPlugin] : []),
      ...plugins,
      DebugPlugin.configure({
        initialState: {
          logger: { warn: (message) => warnings.push(message) },
        },
      }),
    ],
    initialValue,
    userId,
  });
  if (install) editor.install(yjs(collaboration()));
  for (let index = 0; index < writes; index += 1) {
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 4 } });
  }

  return warnings.filter((message) => message.includes('userId')).length;
};

for (const [label, plugins] of Object.entries(yjsCompositions)) {
  it(`warns once when the local user writes beside ${label}`, () => {
    assert.equal(countUserWarnings(plugins()), 1);
  });
}

it('warns once when the local user writes beside a Yjs binding installed later', () => {
  assert.equal(countUserWarnings([], { install: true }), 1);
});

it('does not warn for a named user, an editor that never writes, a disabled Yjs plugin, or a Yjs editor without authored changes', () => {
  assert.deepEqual(
    [
      countUserWarnings(yjsCompositions['a Yjs plugin'](), {
        suggestions: false,
      }),
      countUserWarnings(yjsCompositions['a Yjs plugin'](), { userId: 'alice' }),
      countUserWarnings(yjsCompositions['a Yjs plugin'](), { writes: 0 }),
      countUserWarnings([
        YjsPlugin.create(collaboration()).configure({ enabled: false }),
      ]),
    ],
    [0, 0, 0, 0]
  );
});

it('warns once when the local user comments beside a Yjs plugin without authored changes', async () => {
  const warnings: string[] = [];
  const editor = createEditor({
    plugins: [
      YjsPlugin.create(collaboration()),
      BaseCommentsPlugin,
      DebugPlugin.configure({
        initialState: {
          logger: { warn: (message) => warnings.push(message) },
        },
      }),
    ],
    initialValue,
  });
  const comments = editor.plugin(BaseCommentsPlugin).api;

  for (const id of ['first', 'second']) {
    await comments.createThread({
      body: initialValue,
      id,
      target: {
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        type: 'range',
      },
    });
  }

  assert.equal(
    warnings.filter((message) => message.includes('userId')).length,
    1
  );
});
