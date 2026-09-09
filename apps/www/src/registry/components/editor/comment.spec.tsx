import { afterAll, describe, expect, it } from 'bun:test';

import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createEditor, Plate, usePluginStore } from 'platejs/react';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

import { discussionValue } from '../../examples/values/discussion-value';
import { commentPlugin } from './comment';
import { discussionPlugin } from './discussion';
import { Editor } from './editor';

const originalOrigin = Object.getOwnPropertyDescriptor(
  window.location,
  'origin'
);

afterAll(() => {
  if (originalOrigin) {
    Object.defineProperty(window.location, 'origin', originalOrigin);
  } else {
    Reflect.deleteProperty(window.location, 'origin');
  }
});

function ActiveDiscussion() {
  const activeId = usePluginStore(commentPlugin, 'activeId');
  const discussions = usePluginStore(discussionPlugin, 'discussions');
  const discussion = discussions.find((entry) => entry.id === activeId);

  return (
    <output aria-label="Active discussion">{discussion?.id ?? 'closed'}</output>
  );
}

describe('existing comment activation (#5126)', () => {
  for (const targetText of ['comments', ' on many text segments']) {
    it(`opens and reopens the discussion from one click on ${JSON.stringify(targetText)}`, async () => {
      Object.defineProperty(window.location, 'origin', {
        configurable: true,
        value: 'http://localhost:3000',
      });
      const { EditorKit } = await import('./plugins');
      const editor = createEditor({
        plugins: EditorKit,
        initialValue: discussionValue,
      });
      const view = render(
        <TooltipProvider>
          <Plate editor={editor}>
            <Editor aria-label="Discussion editor" />
            <ActiveDiscussion />
          </Plate>
        </TooltipProvider>
      );
      const user = userEvent.setup({ document: globalThis.document });
      const root = view.getByRole('textbox', { name: 'Discussion editor' });
      const target = [...root.querySelectorAll('.plite-comment')].find(
        (element) => element.textContent === targetText
      );
      const plainText = view.getByText('Discuss changes using', {
        exact: false,
      });
      const activeDiscussion = view.getByLabelText('Active discussion');
      const events: string[] = [];
      const recordEvent = (event: Event) => {
        if (event.target instanceof Node && root.contains(event.target)) {
          events.push(event.type);
        }
      };

      expect(target).toBeDefined();
      expect(document.activeElement).toBe(document.body);
      expect(editor.read.selection()).toBeNull();
      expect(activeDiscussion).toHaveTextContent('closed');

      for (const event of ['pointerdown', 'mousedown', 'focus', 'click']) {
        document.addEventListener(event, recordEvent, true);
      }

      try {
        await user.click(target!);

        expect(events).toEqual(['pointerdown', 'mousedown', 'focus', 'click']);
        expect(activeDiscussion).toHaveTextContent('discussion1');
        expect(
          within(await view.findByRole('dialog')).getByText(
            'Comments are a great way to provide feedback and discuss changes.'
          )
        ).toBeVisible();

        await user.click(plainText);
        expect(activeDiscussion).toHaveTextContent('closed');
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());

        events.length = 0;
        await user.click(target!);
        expect(events.filter((event) => event !== 'focus')).toEqual([
          'pointerdown',
          'mousedown',
          'click',
        ]);
        if (events.includes('focus')) {
          expect(events.indexOf('focus')).toBe(2);
        }
        expect(activeDiscussion).toHaveTextContent('discussion1');
        expect(
          within(await view.findByRole('dialog')).getByText(
            'Comments are a great way to provide feedback and discuss changes.'
          )
        ).toBeVisible();
      } finally {
        for (const event of ['pointerdown', 'mousedown', 'focus', 'click']) {
          document.removeEventListener(event, recordEvent, true);
        }
      }
    });
  }
});
