import { EditableProps } from 'slate-react/dist/components/editable';
import { UsePlateEffectsOptions } from './UsePlateEffectsOptions';

/**
 * Options related to Editable component
 */
export interface UseEditablePropsOptions
  extends Pick<UsePlateEffectsOptions, 'id'> {
  editableProps?: EditableProps;
}
