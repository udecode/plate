export const makeClientRect = ({
  top,
  bottom,
  left,
  right,
}: {
  top: number;
  bottom: number;
  left: number;
  right: number;
}): DOMRect => {
  const width = right - left;
  const height = bottom - top;

  const props: Omit<DOMRect, 'toJSON'> = {
    x: left,
    y: top,
    top,
    bottom,
    left,
    right,
    width,
    height,
  };

  return {
    ...props,
    toJSON: () => props,
  };
};
