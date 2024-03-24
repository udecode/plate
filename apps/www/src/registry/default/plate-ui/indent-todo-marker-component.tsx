import { IMarkerComponentProps } from '@udecode/plate-indent-list';

import { Checkbox } from './checkbox';

export const TodoMarker = (props: IMarkerComponentProps) => {
  const { onChange, checked } = props;
  return (
    <Checkbox
      style={{ left: -24, top: 4, position: 'absolute' }}
      onCheckedChange={onChange}
      checked={checked}
    />
  );
};
