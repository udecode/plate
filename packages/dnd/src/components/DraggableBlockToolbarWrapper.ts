import {
  AsProps,
  createComponentAs,
  createElementAs,
} from '@udecode/plate-core';

export const DraggableBlockToolbarWrapper = createComponentAs<AsProps<'div'>>(
  (props) => createElementAs('div', props)
);
