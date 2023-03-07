import {
  AsProps,
  createComponentAs,
  createElementAs,
} from '@udecode/plate-common';

export const DraggableBlockToolbarWrapper = createComponentAs<AsProps<'div'>>(
  (props) => createElementAs('div', props)
);
