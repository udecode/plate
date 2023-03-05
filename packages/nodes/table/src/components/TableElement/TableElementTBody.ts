import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export const TableElementTBody = createComponentAs<HTMLPropsAs<'tbody'>>(
  (props) => createElementAs('tbody', props)
);
