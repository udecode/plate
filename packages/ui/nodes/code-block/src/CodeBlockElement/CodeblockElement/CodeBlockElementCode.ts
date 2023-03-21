import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export const CodeBlockElementCode = createComponentAs<HTMLPropsAs<'code'>>(
  (props) => createElementAs('code', props)
);
