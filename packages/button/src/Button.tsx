import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export type ButtonProps = HTMLPropsAs<'button'>;

export const Button = createComponentAs<AsProps<'button'>>((props) =>
  createElementAs('button', props)
);
