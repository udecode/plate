/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseLinkPlugin } from '../BaseLinkPlugin';
import { unwrapLink } from './unwrapLink';

jsxt;

describe('unwrapLink', () => {
  it('unwraps an entire link when split mode is off', () => {
    const input = (
      <editor>
        <hp>
          before <ha url="https://example.com">link</ha> after
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [BaseLinkPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      value: input.children,
    });

    unwrapLink(editor);

    expect(editor.children).toEqual(
      (
        <editor>
          <hp>before link after</hp>
        </editor>
      ).children
    );
  });

  it('split mode preserves the linked prefix and unwraps the trailing fragment', () => {
    const editor = createSlateEditor({
      plugins: [BaseLinkPlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: 'x' },
            {
              children: [{ text: 'abcdef' }],
              type: 'a',
              url: 'https://example.com',
            },
            { text: 'y' },
          ],
          type: 'p',
        },
      ],
    });

    unwrapLink(editor, { split: true });

    expect(editor.children).toEqual([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: 'abcd' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'efy' },
        ],
        type: 'p',
      },
    ]);
  });

  it('split mode preserves the linked suffix when only the focus is inside the link', () => {
    const editor = createSlateEditor({
      plugins: [BaseLinkPlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: 'x' },
            {
              children: [{ text: 'abcdef' }],
              type: 'a',
              url: 'https://example.com',
            },
            { text: 'y' },
          ],
          type: 'p',
        },
      ],
    });

    unwrapLink(editor, { split: true });

    expect(editor.children).toEqual([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: 'ab' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'cdefy' },
        ],
        type: 'p',
      },
    ]);
  });

  it('split mode preserves the linked suffix when only the anchor is inside the link', () => {
    const editor = createSlateEditor({
      plugins: [BaseLinkPlugin],
      selection: {
        anchor: { offset: 4, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 2] },
      },
      value: [
        {
          children: [
            { text: 'x' },
            {
              children: [{ text: 'abcdef' }],
              type: 'a',
              url: 'https://example.com',
            },
            { text: 'y' },
          ],
          type: 'p',
        },
      ],
    });

    unwrapLink(editor, { split: true });

    expect(editor.children).toEqual([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: 'abcd' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'efy' },
        ],
        type: 'p',
      },
    ]);
  });
});
