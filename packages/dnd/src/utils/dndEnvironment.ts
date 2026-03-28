import type {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';

export const canUseDomDnd = () =>
  typeof document !== 'undefined' && typeof window !== 'undefined';

export const noopConnector = ((value: any) => value) as ConnectDragPreview &
  ConnectDragSource &
  ConnectDropTarget;
