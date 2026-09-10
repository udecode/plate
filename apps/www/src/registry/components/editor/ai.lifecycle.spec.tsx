import { afterAll, afterEach, expect, test } from 'bun:test';

import { act, render } from '@testing-library/react';
import { AIChatPlugin } from 'platejs/ai/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { createEditor } from 'platejs/react';
import React from 'react';

import { AIKit } from '@/registry/components/editor/ai';
import { AIChatTransportPlugin } from '@/registry/components/editor/use-chat';

import {
  Assembly,
  adapter,
  chunk,
  controlledFetch,
  emptyState,
  flush,
  makeEditor,
  streamState,
  value,
} from './ai.lifecycle-test-support';

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
    expect(value(editor)).toContain('hello');
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
    expect(value(editor)).not.toContain('forbidden');
    await act(async () => http.requests[0].close());
    await flush();
    await act(async () => editor.plugin(AIChatPlugin).api.reload());
    expect(http.requests).toHaveLength(2);
    expect(http.requests[1].signal.aborted).toBe(false);
    await chunk(http.requests[1], 'retry response');
    expect(value(editor)).toContain('retry response');
    expect(value(editor)).not.toContain('forbidden');
    await act(async () => {
      http.requests[1].send({ type: 'text-end', id: 't' });
      http.requests[1].send({ type: 'finish' });
      http.requests[1].close();
    });
    await flush();
    expect(streamState(editor)).toEqual(emptyState);
  } finally {
    await act(async () => {
      view.unmount();
      http.requests.forEach((request) => request.close());
    });
    http.restore();
  }
  expect(editor.plugin(AIChatPlugin).store.get('chat')).toBeNull();
});

for (const boundary of ['readonly', 'unmount', 'finish']) {
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
      expect(value(editor)).toContain('hello');
      const before = value(editor);
      if (boundary === 'readonly') {
        view.rerender(<Assembly editor={editor} readOnly={[true]} />);
      } else if (boundary === 'unmount') view.unmount();
      else {
        await act(async () => {
          http.requests[0].send({ type: 'text-end', id: 't' });
          http.requests[0].send({ type: 'finish' });
          http.requests[0].close();
          await pending;
        });
      }
      await flush();
      expect(streamState(editor)).toEqual(emptyState);
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
    expect(value(first)).toContain('first response');
    expect(value(first)).not.toContain('second response');
    expect(value(second)).toContain('second response');
    expect(value(second)).not.toContain('first response');
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
    expect(value(second)).toContain('second response continues');
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
      expect(value(editor)).not.toContain('one');
      expect(http.requests).toHaveLength(1);
      await act(async () => {
        restarted = adapter(editor).sendMessage('restart');
      });
      expect(http.requests).toHaveLength(2);
      await act(async () => http.requests[1].open());
      await chunk(http.requests[1], 'restarted');
      expect(value(editor)).toContain('restarted');
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
    expect(value(editor)).toBe(before);
    expect(http.requests).toHaveLength(1);
  } finally {
    view.unmount();
    http.requests.forEach((request) => request.close());
    await pending;
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
    expect(value(editor).match(/hello/g)).toHaveLength(1);
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
      expect(value(editor).match(/hello/g)).toHaveLength(1);
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
      expect(value(editor).match(/hello/g)).toHaveLength(1);
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
    expect(value(editor).match(/hello/g)).toHaveLength(1);
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
