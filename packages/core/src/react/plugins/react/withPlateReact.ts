import type { DomConfig, WithAnyKey } from '../../../lib';

import type { ExtendEditor } from '../../plugin/PlatePlugin';

export const withPlateReact: ExtendEditor<WithAnyKey<DomConfig>> = ({
  editor,
}) => editor;
