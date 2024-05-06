import type { TIndentElement } from '@udecode/plate-indent';
import type { LiFC, MarkerFC } from '@udecode/plate-indent-list';

export const FireMarker: MarkerFC = (props) => {
  const { element } = props;

  return (
    <div contentEditable={false}>
      <span style={{ left: -26, position: 'absolute', top: -1 }}>
        {(element as TIndentElement).indent % 2 === 0 ? '🔥' : '🚀'}
      </span>
    </div>
  );
};

export const FireLiComponent: LiFC = (props) => {
  const { children } = props;

  return <span>{children}</span>;
};
