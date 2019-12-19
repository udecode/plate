import { SlatePlugin } from 'slate-react';
import { renderElementLink } from './renderElementLink';
import { withLink } from './withLink';

export const LinkPlugin = (): SlatePlugin => ({
  editor: withLink,
  renderElement: renderElementLink,
});
