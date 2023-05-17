import { AsProps, HTMLPropsAs } from '../types/index';
import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/index';

export const Box = createComponentAs<AsProps<'div'>>((props) =>
  createElementAs('div', props)
);

export type BoxProps = HTMLPropsAs<'div'>;
