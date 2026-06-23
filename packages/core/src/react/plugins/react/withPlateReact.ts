import type { DomConfig, WithAnyKey } from '../../../lib';

import { withReact } from 'slate-react';

import type { ExtendEditor } from '../../plugin/PlatePlugin';

export const withPlateReact: ExtendEditor<WithAnyKey<DomConfig>> = ({
  editor,
}) => {
  withReact(editor as unknown as Parameters<typeof withReact>[0]);

  return editor;
};
