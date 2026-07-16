import type { MdMdxJsxTextElement } from '../../mdast';

export const getStyleValue = (
  mdastNode: MdMdxJsxTextElement,
  styleName: string
): string | undefined => {
  const styleAttribute = mdastNode.attributes.find(
    (attr) =>
      attr.type === 'mdxJsxAttribute' &&
      attr.name === 'style' &&
      typeof attr.value === 'string'
  );

  if (!styleAttribute || typeof styleAttribute.value !== 'string') return;

  const styles = styleAttribute.value.split(';');
  for (const style of styles) {
    const [name, value] = style.split(':').map((part) => part.trim());
    if (name === styleName) {
      return value;
    }
  }
  return;
};
