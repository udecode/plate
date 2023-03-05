import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export const TableElementCol = createComponentAs<HTMLPropsAs<'col'>>((props) =>
  createElementAs('col', props)
);
