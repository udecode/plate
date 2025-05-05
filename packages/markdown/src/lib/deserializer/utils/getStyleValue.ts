import type { MdMdxJsxTextElement } from '../../mdast';

export const getStyleValue = (
  mdastNode: MdMdxJsxTextElement,
  styleName: string
): string | undefined => {
  const styleAttribute = mdastNode.attributes.find(
    (attr) => 'name' in attr && attr.name === 'style'
  ) as any;

  const mach = styleAttribute?.value?.match(
    new RegExp(`${styleName}:\\s*([^;]+);`)
  );
  return mach ? mach[1] : undefined;
};
