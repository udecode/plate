import { createElementAs } from '@udecode/slate-react-utils/src/utils';
import { AsProps } from '../../../core/src/types';
import { createComponentAs } from '../utils/react/createComponentAs';

export const Box = createComponentAs<AsProps<'div'>>((props) =>
  createElementAs('div', props)
);
