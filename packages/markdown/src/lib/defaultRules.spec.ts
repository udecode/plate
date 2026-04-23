import { BaseImagePlugin } from '../../../media/src/lib';

import { createTestEditor } from './__tests__/createTestEditor';
import { buildRules } from './rules/defaultRules';

describe('defaultRules', () => {
  it('prefers image attributes over mdast url and alt fields', () => {
    const editor = createTestEditor([BaseImagePlugin]);

    const result = buildRules(editor).img.deserialize!(
      {
        alt: 'fallback alt',
        attributes: [
          { name: 'alt', type: 'mdxJsxAttribute', value: 'caption alt' },
          { name: 'src', type: 'mdxJsxAttribute', value: '/from-attr.png' },
          { name: 'width', type: 'mdxJsxAttribute', value: '320' },
        ],
        title: 'Image title',
        type: 'image',
        url: '/from-mdast.png',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual({
      caption: [{ text: 'caption alt' }],
      children: [{ text: '' }],
      title: 'Image title',
      type: 'img',
      url: '/from-attr.png',
      width: 320,
    });
  });

  it('keeps mdast image fields when mdx attributes are absent', () => {
    const editor = createTestEditor([BaseImagePlugin]);

    const result = buildRules(editor).img.deserialize!(
      {
        alt: 'fallback alt',
        title: 'Image title',
        type: 'image',
        url: '/from-mdast.png',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual({
      caption: [{ text: 'fallback alt' }],
      children: [{ text: '' }],
      title: 'Image title',
      type: 'img',
      url: '/from-mdast.png',
    });
  });

  it('parses numeric width and height image attributes', () => {
    const editor = createTestEditor([BaseImagePlugin]);

    const result = buildRules(editor).img.deserialize!(
      {
        attributes: [
          { name: 'alt', type: 'mdxJsxAttribute', value: 'caption alt' },
          { name: 'height', type: 'mdxJsxAttribute', value: '180' },
          { name: 'src', type: 'mdxJsxAttribute', value: '/from-attr.png' },
          { name: 'width', type: 'mdxJsxAttribute', value: '320' },
        ],
        type: 'image',
        url: '/from-mdast.png',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual({
      caption: [{ text: 'caption alt' }],
      children: [{ text: '' }],
      height: 180,
      type: 'img',
      url: '/from-attr.png',
      width: 320,
    });
  });
});
