import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/createElementAs';
import { AsProps } from '../utils/types';

// type CheckboxElement = ElementRef<typeof Primitive.button>;

export const Box = createComponentAs<AsProps<'div'>>((props) =>
  createElementAs('div', props)
);
