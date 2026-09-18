import { afterAll, afterEach, expect, test } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { AIChatPlugin } from 'platejs/ai/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { EditorRoot, createEditor } from 'platejs/react';
import React from 'react';

import { Command, CommandList } from '@/components/ui/command';
import { AIKit } from '@/registry/components/editor/ai';
import { AIMenuItems } from '@/registry/components/editor/ai-menu';
import { AIChatTransportPlugin } from '@/registry/components/editor/use-chat';

import {
  Assembly,
  Body,
  adapter,
  chunk,
  controlledFetch,
  emptyState,
  flush,
  makeEditor,
  streamState,
  value,
  draft,
} from './ai.lifecycle-test-support';

test('Generate MDX sample submits and renders streamed MDX chunks', async () => {
  const http = controlledFetch();
  const editor = makeEditor(true);
  const view = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <Body editor={editor} />
      <Command>
        <CommandList>
          <AIMenuItems input="" setInput={() => {}} setValue={() => {}} />
        </CommandList>
      </Command>
    </EditorRoot>
  );

  try {
    fireEvent.click(view.getByText('Generate MDX sample'));
    await flush();

    expect(http.requests).toHaveLength(1);
    expect(String(http.requests[0].body)).toContain('Generate a mdx sample');

    act(() => {
      http.requests[0].send({ type: 'start', messageId: 'assistant' });
      http.requests[0].send({
        type: 'data-toolName',
        data: 'generate',
        transient: true,
      });
      http.requests[0].send({ type: 'text-start', id: 'mdx' });
    });

    for (const delta of [
      '## ',
      'Basic ',
      'Markdown\n\n',
      '<callout>\n',
      'Streaming ',
      'works.\n',
      '</callout>\n\n',
      'Final block.',
    ]) {
      act(() => {
        http.requests[0].send({ type: 'text-delta', id: 'mdx', delta });
      });
      await flush();
    }

    await act(async () => {
      http.requests[0].send({ type: 'text-end', id: 'mdx' });
      http.requests[0].send({ type: 'finish' });
      http.requests[0].close();
    });
    await flush();

    expect(view.container.textContent).toContain('Basic Markdown');
    expect(view.container.textContent).toContain('Streaming works.');
    expect(view.container.textContent).toContain('Final block.');
    expect(adapter(editor).status).toBe('ready');
    expect(streamState(editor).streaming).toBe(false);
  } finally {
    view.unmount();
    http.requests.forEach((request) => request.close());
    http.restore();
  }
});

test('AIKit waits for a mounted view and retires its adapter on detach', async () => {
  const http = controlledFetch();
  const editor = makeEditor();
  const view = render(<Assembly editor={editor} visible={[false]} />);
  try {
    expect(editor.plugin(AIChatPlugin).store.get('chat')).toBeNull();
    expect(http.requests).toHaveLength(0);
    view.rerender(<Assembly editor={editor} />);
    const mounted = adapter(editor);
    expect(http.requests).toHaveLength(0);
    view.rerender(<Assembly editor={editor} visible={[false]} />);
    expect(editor.plugin(AIChatPlugin).store.get('chat')).toBeNull();
    await expect(mounted.sendMessage('late')).rejects.toThrow(
      'writable editor'
    );
    expect(http.requests).toHaveLength(0);
    view.rerender(<Assembly editor={editor} />);
    expect(adapter(editor).stop).not.toBe(mounted.stop);
  } finally {
    view.unmount();
    http.restore();
  }
});

test('AIKit installs its transport prerequisite and streams without another feature kit', async () => {
  const http = controlledFetch();
  const editor = createEditor({
    plugins: AIKit,
    initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    userId: 'alice',
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    },
  });
  const view = render(<Assembly editor={editor} />);
  let pending: Promise<void> | undefined;
  try {
    expect(editor.plugin(MarkdownPlugin).installed).toBe(true);
    await act(async () => {
      pending = adapter(editor).sendMessage('one');
    });
    await chunk(http.requests[0]);
    expect(draft(editor)).toContain('hello');
  } finally {
    await act(async () => {
      view.unmount();
      http.requests.forEach((request) => request.close());
      await pending;
    });
    http.restore();
  }
});

const errors: string[] = [];
const windowError = (event: ErrorEvent) =>
  errors.push(event.error?.message ?? event.message);
window.addEventListener('error', windowError);
afterAll(() => window.removeEventListener('error', windowError));
afterEach(async () => {
  await flush();
  expect(errors).toEqual([]);
});

test('public retry after stopping before the first chunk creates one fresh request', async () => {
  const http = controlledFetch();
  const editor = makeEditor();
  const view = render(<Assembly editor={editor} />);
  try {
    await act(async () => {
      editor.plugin(AIChatPlugin).api.submit('draft', { mode: 'insert' });
    });
    expect(http.requests).toHaveLength(1);
    await act(async () => editor.plugin(AIChatPlugin).api.stop());
    expect(http.requests[0].signal.aborted).toBe(true);
    expect(value(editor)).toContain('original');
    await chunk(http.requests[0], 'forbidden');
    expect(draft(editor)).not.toContain('forbidden');
    await act(async () => http.requests[0].close());
    await flush();
    await act(async () => editor.plugin(AIChatPlugin).api.reload());
    expect(http.requests).toHaveLength(2);
    expect(http.requests[1].signal.aborted).toBe(false);
    await chunk(http.requests[1], 'retry response');
    expect(draft(editor)).toContain('retry response');
    expect(draft(editor)).not.toContain('forbidden');
    await act(async () => {
      http.requests[1].send({ type: 'text-end', id: 't' });
      http.requests[1].send({ type: 'finish' });
      http.requests[1].close();
    });
    await flush();
    expect(streamState(editor)).toMatchObject({
      preview: expect.stringContaining('retry response'),
      streaming: false,
    });
    expect(streamState(editor).key).toEqual(expect.any(String));
  } finally {
    await act(async () => {
      view.unmount();
      http.requests.forEach((request) => request.close());
    });
    http.restore();
  }
  expect(editor.plugin(AIChatPlugin).store.get('chat')).toBeNull();
});

for (const boundary of ['readonly', 'unmount', 'finish', 'hide']) {
  test(`${boundary} retires streaming state and fences late writes`, async () => {
    const http = controlledFetch();
    const editor = makeEditor();
    const view = render(<Assembly editor={editor} />);
    let pending: Promise<void> | undefined;
    try {
      await flush();
      await act(async () => {
        pending = adapter(editor).sendMessage('one');
      });
      await chunk(http.requests[0]);
      expect(streamState(editor).streaming).toBe(true);
      expect(draft(editor)).toContain('hello');
      const before = value(editor);
      if (boundary === 'readonly') {
        view.rerender(<Assembly editor={editor} readOnly={[true]} />);
      } else if (boundary === 'unmount') view.unmount();
      else if (boundary === 'hide') {
        await act(async () =>
          editor.plugin(AIChatPlugin).api.hide({ focus: false })
        );
      } else {
        await act(async () => {
          http.requests[0].send({ type: 'text-end', id: 't' });
          http.requests[0].send({ type: 'finish' });
          http.requests[0].close();
          await pending;
        });
      }
      await flush();
      if (boundary === 'unmount' || boundary === 'hide') {
        expect(streamState(editor)).toEqual(emptyState);
      } else {
        expect(streamState(editor)).toMatchObject({
          preview: expect.stringContaining('hello'),
          streaming: false,
        });
        expect(streamState(editor).key).toEqual(expect.any(String));
      }
      if (boundary !== 'finish') {
        expect(http.requests[0].signal.aborted).toBe(true);
        await act(async () => {
          http.requests[0].send({
            type: 'data-toolName',
            data: 'edit',
            transient: true,
          });
          http.requests[0].send({
            type: 'text-delta',
            id: 't',
            delta: 'forbidden',
          });
        });
        await flush();
        expect(value(editor)).toBe(before);
        expect(editor.plugin(AIChatPlugin).store.get('toolName')).not.toBe(
          'edit'
        );
      }
    } finally {
      await act(async () => {
        view.unmount();
        http.requests.forEach((request) => request.close());
        await pending;
      });
      http.restore();
    }
  });
}

test('independent editor objects stream concurrently and retire independently', async () => {
  const http = controlledFetch();
  const first = makeEditor();
  const second = makeEditor();
  const assembly = (showFirst = true) => (
    <>
      {showFirst && <Assembly editor={first} />}
      <Assembly editor={second} />
    </>
  );
  const view = render(assembly());
  const pending: Array<Promise<void>> = [];
  try {
    await flush();
    expect(adapter(first).stop).not.toBe(adapter(second).stop);
    await act(async () => {
      pending.push(adapter(first).sendMessage('first'));
      pending.push(adapter(second).sendMessage('second'));
    });
    expect(http.requests).toHaveLength(2);
    await chunk(http.requests[0], 'first response');
    await chunk(http.requests[1], 'second response');
    expect(draft(first)).toContain('first response');
    expect(draft(first)).not.toContain('second response');
    expect(draft(second)).toContain('second response');
    expect(draft(second)).not.toContain('first response');
    view.rerender(assembly(false));
    expect(http.requests[0].signal.aborted).toBe(true);
    expect(http.requests[1].signal.aborted).toBe(false);
    await act(async () =>
      http.requests[1].send({
        type: 'text-delta',
        id: 't',
        delta: ' continues',
      })
    );
    await flush();
    await waitFor(() =>
      expect(draft(second)).toContain('second response continues')
    );
  } finally {
    await act(async () => {
      view.unmount();
      http.requests.forEach((request) => request.close());
      await Promise.all(pending);
    });
    http.restore();
  }
});

for (const boundary of ['HTTP', 'rejection']) {
  test(`stop before ${boundary} settlement permits one explicit restart`, async () => {
    const http = controlledFetch(true);
    const editor = makeEditor();
    const view = render(<Assembly editor={editor} />);
    let pending: Promise<void> | undefined;
    let restarted: Promise<void> | undefined;
    try {
      await flush();
      await act(async () => {
        pending = adapter(editor).sendMessage('one');
      });
      expect(http.requests).toHaveLength(1);
      await act(async () => adapter(editor).stop());
      await act(async () => {
        if (boundary === 'HTTP') http.requests[0].fail();
        else http.requests[0].reject();
        await pending;
      });
      expect(streamState(editor)).toEqual(emptyState);
      expect(http.requests[0].signal.aborted).toBe(true);
      expect(draft(editor)).not.toContain('one');
      expect(http.requests).toHaveLength(1);
      await act(async () => {
        restarted = adapter(editor).sendMessage('restart');
      });
      expect(http.requests).toHaveLength(2);
      await act(async () => http.requests[1].open());
      await chunk(http.requests[1], 'restarted');
      expect(draft(editor)).toContain('restarted');
      expect(http.requests[1].signal.aborted).toBe(false);
    } finally {
      await act(async () => {
        view.unmount();
        http.requests.forEach((request) => request.close());
        await pending;
        await restarted;
      });
      http.restore();
    }
  });
}

test('an HTTP error remains an error until an explicit retry', async () => {
  const http = controlledFetch(true);
  const editor = makeEditor();
  const view = render(<Assembly editor={editor} />);
  let pending: Promise<void> | undefined;
  try {
    await flush();
    const before = value(editor);
    await act(async () => {
      pending = adapter(editor).sendMessage('request');
    });
    await act(async () => {
      http.requests[0].reject();
      await pending;
    });
    expect(adapter(editor).status).toBe('error');
    expect(adapter(editor).error?.message).toBe('fetch failed');
    expect(value(editor)).toBe(before);
    expect(http.requests).toHaveLength(1);
  } finally {
    view.unmount();
    http.requests.forEach((request) => request.close());
    await pending;
    http.restore();
  }
});

test('public Stop flushes the buffered final text before accepting the partial draft', async () => {
  const http = controlledFetch();
  const editor = makeEditor();
  const view = render(<Assembly editor={editor} />);
  try {
    await act(async () => {
      editor.plugin(AIChatPlugin).api.submit('generate');
    });
    await chunk(http.requests[0], 'A');
    await act(async () => {
      http.requests[0].send({ type: 'text-delta', id: 't', delta: 'B' });
    });
    act(() => editor.plugin(AIChatPlugin).api.stop());
    expect(draft(editor)).toContain('AB');
    act(() => editor.plugin(AIChatPlugin).api.accept());
    expect(value(editor)).toContain('AB');
  } finally {
    view.unmount();
    http.requests.forEach((request) => request.close());
    await flush();
    http.restore();
  }
});

test('a replacement request aborts and fences the preceding transport even if it keeps sending', async () => {
  const http = controlledFetch();
  const editor = makeEditor();
  const view = render(<Assembly editor={editor} />);
  const pending: Array<Promise<void>> = [];
  try {
    await act(async () => {
      pending.push(adapter(editor).sendMessage('first'));
    });
    await chunk(http.requests[0], 'first draft');
    await act(async () => {
      pending.push(adapter(editor).sendMessage('second'));
    });
    expect(http.requests[0].signal.aborted).toBe(true);
    await chunk(http.requests[1], 'second draft');
    await act(async () => {
      http.requests[0].send({
        type: 'data-toolName',
        transient: true,
        data: 'comment',
      });
      http.requests[0].send({
        type: 'text-delta',
        id: 't',
        delta: ' obsolete',
      });
      http.requests[0].close();
      await pending[0];
    });
    expect(editor.plugin(AIChatPlugin).store.get('toolName')).not.toBe(
      'comment'
    );
    expect(adapter(editor).status).toBe('streaming');
    expect(http.requests[1].signal.aborted).toBe(false);
    await act(async () => {
      http.requests[1].send({
        type: 'text-delta',
        id: 't',
        delta: ' complete',
      });
      http.requests[1].close();
      await pending[1];
    });
    expect(draft(editor)).toContain('second draft complete');
    expect(draft(editor)).not.toContain('obsolete');
    expect(adapter(editor).messages.at(-1)?.parts).toContainEqual({
      type: 'text',
      text: 'second draft complete',
      state: 'streaming',
    });
  } finally {
    view.unmount();
    http.requests.forEach((request) => request.close());
    await Promise.all(pending);
    http.restore();
  }
});

test('initial readonly publishes an adapter; writable recovery and custom slots need no automatic submission', async () => {
  const http = controlledFetch();
  const editor = makeEditor();
  const view = render(
    <React.StrictMode>
      <Assembly editor={editor} readOnly={[true]} />
    </React.StrictMode>
  );
  let pending: Promise<void> | undefined;
  try {
    await flush();
    expect(adapter(editor)).toBeTruthy();
    expect(view.getByTestId('view-0').getAttribute('contenteditable')).toBe(
      'true'
    );
    expect(view.getByTestId('view-0').getAttribute('aria-readonly')).toBe(
      'true'
    );
    await expect(adapter(editor).sendMessage('blocked')).rejects.toThrow(
      /writable/
    );
    view.rerender(
      <React.StrictMode>
        <Assembly editor={editor} readOnly={[false]} />
      </React.StrictMode>
    );
    await flush();
    expect(http.requests).toHaveLength(0);
    expect(view.getByTestId('custom-ai-menu')).toBeTruthy();
    expect(view.getByTestId('custom-ai-root')).toBeTruthy();
    await act(async () => {
      pending = adapter(editor).sendMessage('one');
    });
    await chunk(http.requests[0]);
    expect(http.requests).toHaveLength(1);
    expect(draft(editor).match(/hello/g)).toHaveLength(1);
  } finally {
    await act(async () => {
      view.unmount();
      http.requests.forEach((request) => request.close());
      await pending;
    });
    http.restore();
  }
  expect(editor.plugin(AIChatPlugin).store.get('chat')).toBeNull();
});

for (const primary of [false, true]) {
  test(`mixed views first readonly=${primary}: one session uses the writable view`, async () => {
    const http = controlledFetch();
    const editor = makeEditor();
    const view = render(
      <Assembly editor={editor} views={2} readOnly={[primary, !primary]} />
    );
    let pending: Promise<void> | undefined;
    try {
      await flush();
      expect(editor.read.view.isReadOnly()).toBe(false);
      expect(
        view.getByTestId('view-0').getAttribute('aria-readonly') === 'true'
      ).toBe(primary);
      expect(
        view.getByTestId('view-1').getAttribute('aria-readonly') === 'true'
      ).toBe(!primary);
      await act(async () => {
        pending = adapter(editor).sendMessage('one');
      });
      await chunk(http.requests[0]);
      expect(http.requests).toHaveLength(1);
      expect(draft(editor).match(/hello/g)).toHaveLength(1);
    } finally {
      await act(async () => {
        view.unmount();
        http.requests.forEach((request) => request.close());
        await pending;
      });
      http.restore();
    }
  });
}

for (const owner of [0, 1]) {
  test(`view ${owner} becomes readonly while the shared session retains a writable sibling`, async () => {
    const http = controlledFetch();
    const editor = makeEditor();
    const view = render(
      <Assembly editor={editor} views={2} readOnly={[false, false]} />
    );
    let pending: Promise<void> | undefined;
    try {
      await flush();
      const old = adapter(editor);
      await act(async () => {
        pending = old.sendMessage('one');
      });
      view.rerender(
        <Assembly
          editor={editor}
          views={2}
          readOnly={owner === 0 ? [true, false] : [false, true]}
        />
      );
      await flush();
      await chunk(http.requests[0]);
      expect(http.requests[0].signal.aborted).toBe(false);
      expect(adapter(editor).stop).toBe(old.stop);
      expect(draft(editor).match(/hello/g)).toHaveLength(1);
      expect(http.requests).toHaveLength(1);
      view.rerender(
        <Assembly editor={editor} views={2} readOnly={[true, true]} />
      );
      await flush();
      expect(http.requests[0].signal.aborted).toBe(true);
      const stoppedValue = value(editor);
      await chunk(http.requests[0], 'forbidden');
      expect(value(editor)).toBe(stoppedValue);
      await expect(old.sendMessage('blocked')).rejects.toThrow(/writable/);
    } finally {
      await act(async () => {
        view.unmount();
        http.requests.forEach((request) => request.close());
        await pending;
      });
      http.restore();
    }
  });
}

for (const replacement of ['session', 'editor', 'endpoint']) {
  test(`${replacement} replacement owns callbacks; old stop/late native completion cannot stop it`, async () => {
    const http = controlledFetch();
    let editor = makeEditor();
    const view = render(<Assembly editor={editor} />);
    let oldPending: Promise<void> | undefined;
    let newPending: Promise<void> | undefined;
    try {
      await flush();
      const old = adapter(editor);
      await act(async () => {
        oldPending = old.sendMessage('old');
      });
      await chunk(http.requests[0], 'old');
      if (replacement === 'editor') {
        editor = makeEditor();
        view.rerender(<Assembly editor={editor} />);
      } else if (replacement === 'endpoint') {
        await act(async () =>
          editor
            .plugin(AIChatTransportPlugin)
            .store.set({ chatOptions: { api: '/replacement', body: {} } })
        );
      } else view.rerender(<Assembly editor={editor} sessionKey={1} />);
      await flush();
      expect(http.requests[0].signal.aborted).toBe(true);
      const next = adapter(editor);
      expect(next.stop).not.toBe(old.stop);
      await act(async () => {
        newPending = next.sendMessage('new');
      });
      if (replacement === 'endpoint') {
        expect(http.requests[1].url).toBe('/replacement');
      }
      await chunk(http.requests[1], 'new');
      const current = adapter(editor);
      const state = streamState(editor);
      const before = value(editor);
      await act(async () => {
        await old.stop();
        http.requests[0].send({
          type: 'data-toolName',
          data: 'edit',
          transient: true,
        });
        http.requests[0].close();
        await oldPending;
      });
      await flush();
      expect(http.requests[1].signal.aborted).toBe(false);
      expect(adapter(editor)).toBe(current);
      expect(streamState(editor)).toEqual(state);
      expect(value(editor)).toBe(before);
      expect(editor.plugin(AIChatPlugin).store.get('toolName')).not.toBe(
        'edit'
      );
    } finally {
      await act(async () => {
        view.unmount();
        http.requests.forEach((request) => request.close());
        await oldPending;
        await newPending;
      });
      http.restore();
    }
    expect(streamState(editor)).toEqual(emptyState);
  });
}

test('one shared session survives a view detach and aborts when its last view detaches', async () => {
  const http = controlledFetch();
  const editor = makeEditor();
  const view = render(
    <Assembly editor={editor} views={2} readOnly={[false, false]} />
  );
  let pending: Promise<void> | undefined;
  let restarted: Promise<void> | undefined;
  try {
    await flush();
    const captured = adapter(editor);
    await act(async () => {
      pending = captured.sendMessage('one');
    });
    view.rerender(
      <Assembly
        editor={editor}
        views={2}
        readOnly={[false, false]}
        visible={[false, true]}
      />
    );
    await flush();
    expect(http.requests[0].signal.aborted).toBe(false);
    await chunk(http.requests[0]);
    expect(draft(editor).match(/hello/g)).toHaveLength(1);
    await act(async () => {
      http.requests[0].close();
      await pending;
    });
    await flush();
    await act(async () => {
      restarted = captured.sendMessage('uses remaining view');
    });
    expect(http.requests).toHaveLength(2);
    view.rerender(
      <Assembly
        editor={editor}
        views={2}
        readOnly={[false, false]}
        visible={[false, false]}
      />
    );
    await flush();
    expect(http.requests[1].signal.aborted).toBe(true);
    expect(editor.plugin(AIChatPlugin).store.get('chat')).toBeNull();
    expect(streamState(editor)).toEqual(emptyState);
    const before = value(editor);
    await chunk(http.requests[1], 'late');
    expect(value(editor)).toBe(before);
  } finally {
    await act(async () => {
      view.unmount();
      http.requests.forEach((request) => request.close());
      await pending;
      await restarted;
    });
    http.restore();
  }
});
