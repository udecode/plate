import {
  AsProps,
  createComponentAs,
  createElementAs,
} from '@udecode/plate-core';
import { HTMLPropsAs } from '@udecode/plate-core/src/index';

export type ButtonProps = HTMLPropsAs<'button'>;

export const Button = createComponentAs<AsProps<'button'>>((props) =>
  createElementAs('button', props)
);
