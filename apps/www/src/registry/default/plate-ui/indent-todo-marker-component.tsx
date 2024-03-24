import { IMarkerComponentProps } from '@udecode/plate-indent-list';

import { Checkbox } from './checkbox';

export const TodoMarker = (props: IMarkerComponentProps) => {
  const { onChange, checked } = props;
  return (
    <Checkbox
      style={{ marginLeft: -24, marginRight: 8 }}
      onCheckedChange={onChange}
      checked={checked}
    />
  );
};
