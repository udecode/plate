import { AsProps } from '../types/index';
import { createComponentAs } from '../utils/react/createComponentAs';
import { createElementAs } from '../utils/react/createElementAs';

export const Box = createComponentAs<AsProps<'div'>>((props) =>
  createElementAs('div', props)
);
