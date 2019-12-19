import { SlatePlugin } from 'slate-react';
import { renderElementLink } from './renderElementLink';

export const LinkPlugin = (): SlatePlugin => ({
  renderElement: renderElementLink(),
});
