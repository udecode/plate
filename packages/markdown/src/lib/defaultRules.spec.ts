import {
  createTestEditor,
  getTestDeserializeOptions,
} from './__tests__/createTestEditor';
import { defaultRules } from './rules/defaultRules';
import type { MdRules } from './types';

describe('defaultRules', () => {
  const getImageDeserializer = (): NonNullable<
    NonNullable<MdRules['img']>['deserialize']
  > => {
    const deserialize = defaultRules.img?.deserialize;

    if (!deserialize) throw new Error('Expected the image deserializer.');

    return deserialize;
  };

  it('prefers image attributes over mdast url and alt fields', () => {
    const editor = createTestEditor();

    const result = getImageDeserializer()(
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
      },
      {},
      getTestDeserializeOptions(editor)
    );

    expect(result).toEqual({
      alt: 'caption alt',
      children: [{ text: '' }],
      title: 'Image title',
      type: 'img',
      url: '/from-attr.png',
      width: 320,
    });
  });

  it('keeps mdast image fields when mdx attributes are absent', () => {
    const editor = createTestEditor();

    const result = getImageDeserializer()(
      {
        alt: 'fallback alt',
        title: 'Image title',
        type: 'image',
        url: '/from-mdast.png',
      },
      {},
      getTestDeserializeOptions(editor)
    );

    expect(result).toEqual({
      alt: 'fallback alt',
      children: [{ text: '' }],
      title: 'Image title',
      type: 'img',
      url: '/from-mdast.png',
    });
  });

  it('parses numeric width and height image attributes', () => {
    const editor = createTestEditor();

    const result = getImageDeserializer()(
      {
        attributes: [
          { name: 'alt', type: 'mdxJsxAttribute', value: 'caption alt' },
          { name: 'height', type: 'mdxJsxAttribute', value: '180' },
          { name: 'src', type: 'mdxJsxAttribute', value: '/from-attr.png' },
          { name: 'width', type: 'mdxJsxAttribute', value: '320' },
        ],
        type: 'image',
        url: '/from-mdast.png',
      },
      {},
      getTestDeserializeOptions(editor)
    );

    expect(result).toEqual({
      alt: 'caption alt',
      children: [{ text: '' }],
      height: 180,
      type: 'img',
      url: '/from-attr.png',
      width: 320,
    });
  });
});
