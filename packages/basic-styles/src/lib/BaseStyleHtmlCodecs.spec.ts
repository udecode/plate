import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { ContentSlice } from '@platejs/plite';
import { getExtensionRegistry } from '@platejs/plite/internal';
import { KEYS } from '@platejs/utils';

import { BaseFontBackgroundColorPlugin } from './BaseFontBackgroundColorPlugin';
import { BaseFontColorPlugin } from './BaseFontColorPlugin';
import { BaseFontFamilyPlugin } from './BaseFontFamilyPlugin';
import { BaseFontSizePlugin } from './BaseFontSizePlugin';
import { BaseFontWeightPlugin } from './BaseFontWeightPlugin';
import { BaseLineHeightPlugin } from './BaseLineHeightPlugin';
import { BaseTextAlignPlugin } from './BaseTextAlignPlugin';
import { BaseTextIndentPlugin } from './BaseTextIndentPlugin';

const serializeHtml = (editor: ReturnType<typeof createBaseEditor>) => {
  type Registration = {
    codec: {
      format: string;
      serialize?: (context: {
        format: string;
        slice: ContentSlice;
        state: typeof editor.read;
      }) => null | string;
    };
  };

  const registrations = (getExtensionRegistry(editor).capabilities.get(
    'host.codecs'
  ) ?? []) as readonly Registration[];
  const codec = registrations.find(
    (registration) => registration.codec.format === 'text/html'
  )?.codec;

  if (!codec?.serialize) throw new Error('Missing HTML codec serializer');

  return codec.serialize({
    format: 'text/html',
    slice: ContentSlice.closed(editor.read.children()),
    state: editor.read,
  });
};

describe('basic style HTML codecs', () => {
  it('round-trips mark wrappers and block property patches', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseFontBackgroundColorPlugin,
        BaseFontColorPlugin,
        BaseFontFamilyPlugin,
        BaseFontSizePlugin,
        BaseFontWeightPlugin,
        BaseLineHeightPlugin,
        BaseTextAlignPlugin,
        BaseTextIndentPlugin,
      ],
      initialValue: [
        {
          align: 'center',
          children: [
            {
              backgroundColor: 'yellow',
              color: 'red',
              fontFamily: 'serif',
              fontSize: '18px',
              fontWeight: '700',
              text: 'Styled',
            },
          ],
          lineHeight: 2,
          textIndent: 2,
          type: KEYS.p,
        },
      ],
    });
    const html = serializeHtml(editor);

    expect(html).not.toBeNull();

    const body = new DOMParser().parseFromString(html!, 'text/html').body;
    const paragraph = body.querySelector('p') as HTMLElement;
    const styledElements = Array.from(
      body.querySelectorAll<HTMLElement>('[style]')
    );

    expect(paragraph.style.lineHeight).toBe('2');
    expect(paragraph.style.textAlign).toBe('center');
    expect(paragraph.style.textIndent).toBe('48px');
    expect(paragraph.dataset.textIndent).toBe('2');
    expect(
      styledElements.some(
        (element) => element.style.backgroundColor === 'yellow'
      )
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.color === 'red')
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.fontFamily === 'serif')
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.fontSize === '18px')
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.fontWeight === '700')
    ).toBe(true);
    expect(editor.api.html.deserialize({ element: html! })).toEqual([
      ...editor.read.children(),
    ]);
  });
});
