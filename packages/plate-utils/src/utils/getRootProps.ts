/**
 * Get Plate component root props.
 */
export const getRootProps = <T>(
  props: T
): Omit<
  T,
  | 'editor'
  | 'attributes'
  | 'children'
  | 'nodeProps'
  | 'element'
  | 'leaf'
  | 'text'
> => {
  const {
    editor,
    attributes,
    children,
    nodeProps,
    element,
    leaf,
    text,
    ...rootProps
  } = props as any;

  return rootProps;
};
