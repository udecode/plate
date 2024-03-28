import { TIndentElement } from '@udecode/plate-indent';
import { LiFC, MarkerFC } from '@udecode/plate-indent-list';

export const FireMarker: MarkerFC = (props) => {
  const { element } = props;

  return (
    <div contentEditable={false}>
      <span style={{ left: -26, top: -1, position: 'absolute' }}>
        {(element as TIndentElement).indent % 2 === 0 ? '🔥' : '🚀'}
      </span>
    </div>
  );
};

export const FireLiComponent: LiFC = (props) => {
  const { children } = props;

  return <span>{children}</span>;
};
