import { createComponentAs } from './createComponentAs';
import { createElementAs } from './createElementAs';
import { AsProps } from './types';

export const Box = createComponentAs<AsProps<'div'>>((props) =>
  createElementAs('div', props)
);
