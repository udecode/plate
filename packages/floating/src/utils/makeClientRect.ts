export const makeClientRect = ({
  bottom,
  left,
  right,
  top,
}: {
  bottom: number;
  left: number;
  right: number;
  top: number;
}): DOMRect => {
  const width = right - left;
  const height = bottom - top;

  const props: Omit<DOMRect, 'toJSON'> = {
    bottom,
    height,
    left,
    right,
    top,
    width,
    x: left,
    y: top,
  };

  return {
    ...props,
    toJSON: () => props,
  };
};
