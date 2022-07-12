import {
  AsProps,
  createComponentAs,
  createElementAs,
} from '@udecode/plate-core';

export const Button = createComponentAs<AsProps<'button'>>((props) =>
  createElementAs('button', props)
);
