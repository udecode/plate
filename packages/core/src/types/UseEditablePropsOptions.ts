import { EditableProps } from 'slate-react/dist/components/editable';
import { UseSlatePluginsEffectsOptions } from './UseSlatePluginsEffectsOptions';

/**
 * Options related to Editable component
 */
export interface UseEditablePropsOptions
  extends Pick<UseSlatePluginsEffectsOptions, 'id'> {
  editableProps?: EditableProps;
}
