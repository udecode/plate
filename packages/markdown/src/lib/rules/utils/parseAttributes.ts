import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxExpressionAttribute,
} from 'mdast-util-mdx';

const isAttributeValueExpression = (
  value: unknown
): value is MdxJsxAttributeValueExpression =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  value.type === 'mdxJsxAttributeValueExpression' &&
  'value' in value &&
  typeof value.value === 'string';

// Helper function to parse JSON attributes to props
export function parseAttributes(
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  if (attributes && attributes.length > 0) {
    attributes.forEach((attr) => {
      if (attr.type === 'mdxJsxAttribute' && attr.value !== undefined) {
        let value: unknown = attr.value;

        if (typeof attr.value === 'string') {
          try {
            value = JSON.parse(attr.value);
          } catch {
            ({ value } = attr);
          }
        }

        props[attr.name] = value;
      }
    });
  }

  return props;
}

// Helper function to convert props to attributes
export function propsToAttributes(
  props: Record<string, unknown>
): MdxJsxAttribute[] {
  return Object.entries(props).map(([name, value]) => ({
    name,
    type: 'mdxJsxAttribute',
    value:
      typeof value === 'string' || isAttributeValueExpression(value)
        ? value
        : (JSON.stringify(value) ?? String(value)),
  }));
}
