import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export const TableElementCol = createComponentAs<HTMLPropsAs<'col'>>((props) =>
  createElementAs('col', props)
);
