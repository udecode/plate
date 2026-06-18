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
    'data-slate-zero-width': string;
    'data-slate-length': number;
    'data-slate-mark-placeholder'?: boolean;
  } = {
    'data-slate-zero-width': isLineBreak ? 'n' : 'z',
    'data-slate-length': length,
  };

  if (isMarkPlaceholder) {
    attributes['data-slate-mark-placeholder'] = true;
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
