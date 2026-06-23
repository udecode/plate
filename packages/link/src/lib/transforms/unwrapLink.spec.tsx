/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseLinkPlugin } from '../BaseLinkPlugin';
import { unwrapLink } from './unwrapLink';

jsxt;

describe('unwrapLink', () => {
  const root = (editor: { read: <T>(fn: (state: any) => T) => T }) =>
    editor.read((state) => state.value.root());

  it('unwraps an entire link when split mode is off', () => {
    const input = (
      <editor>
        <hp>
          before <ha url="https://example.com">link</ha> after
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      initialValue: input.children,
      plugins: [BaseLinkPlugin],
    });

    unwrapLink(editor as unknown as SlateEditor);

    expect(root(editor)).toEqual(
      (
        <editor>
          <hp>before link after</hp>
        </editor>
      ).children
    );
  });

  it('split mode preserves the linked prefix and unwraps the trailing fragment', () => {
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      initialValue: [
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
      plugins: [BaseLinkPlugin],
    });

    unwrapLink(editor as unknown as SlateEditor, { split: true });

    expect(root(editor)).toEqual([
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
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      initialValue: [
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
      plugins: [BaseLinkPlugin],
    });

    unwrapLink(editor as unknown as SlateEditor, { split: true });

    expect(root(editor)).toEqual([
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
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 4, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 2] },
      },
      initialValue: [
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
      plugins: [BaseLinkPlugin],
    });

    unwrapLink(editor as unknown as SlateEditor, { split: true });

    expect(root(editor)).toEqual([
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
