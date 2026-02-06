import type { TElement } from 'platejs';
import type { SerializeMdOptions } from '../serializer';
import { defaultRules } from './defaultRules';
import { createTestEditor } from '../__tests__/createTestEditor';

describe('defaultRules p:', () => {
  it('Should serialize the last line break of a paragraph to a html <br />node', () => {
    const mdast = defaultRules.p!.serialize!(
      {
        type: 'p',
        children: [{ text: 'line1\n' }],
      } as TElement,
      { editor: createTestEditor(), rules: defaultRules } as SerializeMdOptions
    );

    expect(mdast).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'line1' },
        { type: 'html', value: '<br />' },
      ],
    });
  });

  it('Should serialize ONLY the last line break of a paragraph to a html <br />node', () => {
    const mdast = defaultRules.p!.serialize!(
      {
        type: 'p',
        children: [{ text: 'line1\n\n' }],
      } as TElement,
      { editor: createTestEditor(), rules: defaultRules } as SerializeMdOptions
    );

    expect(mdast).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'line1' },
        { type: 'break' },
        { type: 'html', value: '<br />' },
      ],
    });
  });

  it('Should serialize ONLY the last line break of a paragraph to a html <br />node, even with multiple text children', () => {
    const mdast = defaultRules.p!.serialize!(
      {
        type: 'p',
        children: [
          { text: 'line1\n' },
          { text: 'line2\n\n' },
          { text: 'line3\n' },
        ],
      } as TElement,
      { editor: createTestEditor(), rules: defaultRules } as SerializeMdOptions
    );

    expect(mdast).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'line1' },
        { type: 'break' },
        { type: 'text', value: 'line2' },
        { type: 'break' },
        { type: 'break' },
        { type: 'text', value: 'line3' },
        { type: 'html', value: '<br />' },
      ],
    });
  });

  it('Should serialize line breaks in the middle of a paragraph as break nodes', () => {
    const editor = createTestEditor();
    const mdast = defaultRules.p!.serialize!(
      {
        type: 'p',
        children: [{ text: 'line1\nline2\n\nline3' }],
      } as TElement,
      { editor, rules: defaultRules } as SerializeMdOptions
    );

    expect(mdast).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'line1' },
        { type: 'break' },
        { type: 'text', value: 'line2' },
        { type: 'break' },
        { type: 'break' },
        { type: 'text', value: 'line3' },
      ],
    });
  });

  it('Serializes a paragraph with three trailing line breaks as normal line breaks, except for the last one which becomes a <br />', () => {
    /* See the test `serializes three trailing \n in a paragraph as a forced line break and <br />` in `serializeMd.spec.tsx`.
     * This test verifies that the correct mdast is generated from the given slate nodes, while the test in `serializeMd.spec.tsx`
     * verifies that the correct markdown is generated from the same slate nodes. The expected mdast in this test does not
     * match the expected markdown in the other test, which is likely due to the way remark-stringify handles multiple line breaks
     * at the end of a block.
     */
    const mdast = defaultRules.p!.serialize!(
      {
        children: [
          { text: 'Paragraph ending with two blank Lines' },
          { text: '\n' },
          { text: '\n' },
          { text: '\n' },
        ],
        type: 'p',
      } as TElement,
      { editor: createTestEditor(), rules: defaultRules } as SerializeMdOptions
    );

    expect(mdast).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'Paragraph ending with two blank Lines' },
        { type: 'break' },
        { type: 'break' },
        { type: 'html', value: '<br />' },
      ],
    });
  });
});
