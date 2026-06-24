export const ZeroWidthString = ({
  length = 0,
  isLineBreak = false,
  isMarkPlaceholder = false,
  includeSentinel = !isLineBreak,
}: {
  length?: number;
  isLineBreak?: boolean;
  isMarkPlaceholder?: boolean;
  includeSentinel?: boolean;
}) => {
  const attributes: {
    'data-plite-zero-width': string;
    'data-plite-length': number;
    'data-plite-mark-placeholder'?: boolean;
  } = {
    'data-plite-zero-width': isLineBreak ? 'n' : 'z',
    'data-plite-length': length,
  };

  if (isMarkPlaceholder) {
    attributes['data-plite-mark-placeholder'] = true;
  }

  if (isLineBreak) {
    if (includeSentinel) {
      return (
        <span {...attributes}>
          {'\uFEFF'}
          <br />
        </span>
      );
    }

    return (
      <span {...attributes} dangerouslySetInnerHTML={{ __html: '<br />' }} />
    );
  }

  return <span {...attributes}>{'\uFEFF'}</span>;
};
