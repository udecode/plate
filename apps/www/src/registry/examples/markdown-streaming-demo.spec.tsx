import { afterEach, beforeEach, expect, it, jest } from 'bun:test';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import { act, fireEvent, render } from '@testing-library/react';
import { NodeApi } from 'platejs';
import { createStaticEditor } from 'platejs/static';
import * as React from 'react';

import { findDOMRootRuntime } from '../../../../../packages/plitejs/src/dom/internal';
import { BaseEditorKit } from '../components/editor/plugins-static';
import MarkdownStreamingDemo from './markdown-streaming-demo';

Object.assign(globalThis, { React });

const lists = '1. number 1\n- List B\n- [x] Task C';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const mount = () => {
  const view = render(
    <TooltipProvider>
      <MarkdownStreamingDemo />
    </TooltipProvider>
  );
  const root = view.container.querySelector<HTMLElement>(
    '[data-editor="true"]'
  );
  const { editor } = findDOMRootRuntime(root!)!;
  let commits = 0;
  const unsubscribe = editor.subscribeCommit(() => {
    commits += 1;
  });
  const output = () =>
    view.getByRole('heading', { name: 'Editor Output' }).parentElement!;

  return {
    editor,
    view,
    commits: () => commits,
    heading: () => view.getByRole('heading', { name: /^Chunks/ }).textContent,
    output: () => output().textContent,
    status: () =>
      view.container.querySelector('[data-stream-status]')?.textContent,
    select: (label: string, value: string) =>
      act(() => {
        fireEvent.change(view.getByLabelText(label), { target: { value } });
      }),
    click: (label: string) =>
      act(() => {
        fireEvent.click(view.getByLabelText(label));
      }),
    unmount: () => {
      unsubscribe();
      view.unmount();
    },
  };
};

// Step the clock so each awaited delay can schedule the next one.
const advance = async (ms: number, step = 1) => {
  for (let elapsed = 0; elapsed < ms; elapsed += step) {
    await act(async () => {
      jest.advanceTimersByTime(step);
      for (let index = 0; index < 5; index++) await Promise.resolve();
    });
  }
};

it('publishes the first chunk at once, the latest draft every 32 ms and one strict final parse', async () => {
  const demo = mount();

  try {
    demo.select('Scenario', 'lists');
    const commits = demo.commits();
    demo.click('Start streaming');

    expect(demo.heading()).toBe('Chunks (1/7)');
    expect(demo.commits()).toBe(commits + 1);

    await advance(40);
    expect(demo.heading()).toBe('Chunks (5/7)');
    expect(demo.commits()).toBe(commits + 1);

    await advance(2);
    expect(demo.commits()).toBe(commits + 2);
    expect(demo.editor.read.text.string([])).toBe('number 1List B');

    await advance(20);
    expect(demo.heading()).toBe('Chunks (7/7)');
    expect(demo.status()).toBe('Finished: strict parse');
    expect(demo.commits()).toBe(commits + 3);

    const strict = demo.editor.api.markdown.parse(lists);
    if (!strict.ok) throw new Error(strict.diagnostics[0].message);
    expect(demo.editor.read.children()).toEqual(strict.document.children);
    // Previews are ephemeral: none of them entered the undo history.
    expect(demo.editor.read.history().undos).toHaveLength(0);

    await advance(500, 50);
    expect(demo.commits()).toBe(commits + 3);
  } finally {
    demo.unmount();
  }
});

it('stop parses the current draft strictly once and ends the stream', async () => {
  const demo = mount();

  try {
    demo.click('Start streaming');
    // A partial preview hides the tag that is still arriving.
    expect(demo.heading()).toMatch(/^Chunks \(1\//);
    expect(demo.output()).not.toContain('<column');

    const commits = demo.commits();
    demo.click('Stop streaming');

    expect(demo.status()).toBe('Stopped: strict parse');
    expect(demo.commits()).toBe(commits + 1);
    expect(demo.output()).toContain('<column');

    const heading = demo.heading();
    await advance(1000, 50);
    expect(demo.heading()).toBe(heading);
    expect(demo.commits()).toBe(commits + 1);
  } finally {
    demo.unmount();
  }
});

for (const action of [
  'reset',
  'paused reset',
  'scenario',
  'chunk size',
  'source',
  'navigate',
  'preview',
] as const) {
  it(`${action} cancels the stream without a final parse`, async () => {
    const demo = mount();

    try {
      demo.select('Scenario', 'lists');
      demo.click('Start streaming');
      await advance(10);
      expect(demo.heading()).toBe('Chunks (2/7)');

      if (action === 'paused reset') demo.click('Pause streaming');
      const before = demo.commits();
      if (action === 'reset' || action === 'paused reset') {
        demo.click('Reset streaming');
      } else if (action === 'scenario') demo.select('Scenario', 'links');
      else if (action === 'chunk size') demo.select('Chunk size', '16');
      else if (action === 'source') {
        act(() => {
          fireEvent.change(demo.view.getByLabelText('Markdown source'), {
            target: { value: 'replacement' },
          });
        });
      } else if (action === 'navigate') demo.click('Next chunk');
      else demo.select('Preview', 'static');

      const heading = demo.heading();
      const output = demo.output();
      const commits = demo.commits();

      // One replacement commit: the cleared preview or the chosen prefix.
      expect(commits - before).toBe(1);
      expect(demo.status()).not.toMatch(/strict parse/);
      await advance(1000, 50);
      expect(demo.heading()).toBe(heading);
      expect(demo.output()).toBe(output);
      expect(demo.commits()).toBe(commits);
      expect(demo.view.getByLabelText('Start streaming')).toBeTruthy();
    } finally {
      demo.unmount();
    }
  });
}

it('unmount aborts the stream and its pending preview', async () => {
  const demo = mount();

  demo.select('Scenario', 'lists');
  demo.click('Start streaming');
  await advance(10);
  const commits = demo.commits();

  demo.unmount();
  await advance(1000, 50);

  expect(demo.commits()).toBe(commits);
});

it('the static preview uses the same partial and strict parses', async () => {
  const demo = mount();
  const rendered = () =>
    demo.view.container.querySelector('[data-editor-node="value"]')
      ?.textContent;

  try {
    demo.select('Preview', 'static');
    demo.click('Start streaming');
    expect(demo.output()).toContain('paragraph');
    expect(demo.output()).not.toContain('<column');

    await advance(1000);
    expect(demo.status()).toBe('Finished: strict parse');
    expect(demo.output()).not.toMatch(/<\/?column/);
    expect(demo.editor.read.text.string([])).toBe('');

    // Spliced previews show the same blocks as a fresh parse of the draft.
    const parser = createStaticEditor({ plugins: BaseEditorKit });
    const text = (source: string, partial: boolean) => {
      const result = parser.api.markdown.parseSlice(
        source,
        partial ? { lossPolicy: 'allow', partial: true } : {}
      );
      if (!result.ok) throw new Error(result.diagnostics[0].message);

      return result.slice.content.map((node) => NodeApi.string(node)).join('');
    };

    demo.select('Scenario', 'lists');
    demo.click('Start streaming');
    await advance(35);
    demo.click('Pause streaming');
    await advance(50);
    expect(demo.heading()).toBe('Chunks (4/7)');
    expect(rendered()).toBe(text('1. number 1\n- List B\n', true));

    demo.click('Resume streaming');
    await advance(200);
    expect(demo.status()).toBe('Finished: strict parse');
    expect(rendered()).toBe(text(lists, false));
  } finally {
    demo.unmount();
  }
});
