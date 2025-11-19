import type { MdMdxJsxTextElement } from '../../mdast';

export const getStyleValue = (
  mdastNode: MdMdxJsxTextElement,
  styleName: string
): string | undefined => {
  const styleAttribute = mdastNode.attributes.find(
    (attr) => 'name' in attr && attr.name === 'style'
  ) as any;

  if (!styleAttribute?.value) return;

  const styles = styleAttribute.value.split(';');
  for (const style of styles) {
    const [name, value] = style.split(':').map((s: string) => s.trim());
    if (name === styleName) {
      return value;
    }
  }
  return;
};
