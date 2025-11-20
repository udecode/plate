// Helper function to parse JSON attributes to props
export function parseAttributes(attributes: any[]): Record<string, any> {
  const props: Record<string, any> = {};

  if (attributes && attributes.length > 0) {
    attributes.forEach((attr: any) => {
      if (attr.name && attr.value !== undefined) {
        let value = attr.value;

        try {
          value = JSON.parse(attr.value);
        } catch (_error) {
          value = attr.value;
        }

        props[attr.name] = value;
      }
    });
  }

  return props;
}

// Helper function to convert props to attributes
export function propsToAttributes(props: Record<string, any>): any[] {
  return Object.entries(props).map(([name, value]) => ({
    name,
    type: 'mdxJsxAttribute',
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));
}
