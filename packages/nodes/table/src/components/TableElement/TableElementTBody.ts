import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export const TableElementTBody = createComponentAs<HTMLPropsAs<'tbody'>>(
  (props) => createElementAs('tbody', props)
);
