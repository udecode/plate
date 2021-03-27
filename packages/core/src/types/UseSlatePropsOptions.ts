import { TNode } from './TNode';
import { UseSlatePluginsEffectsOptions } from './UseSlatePluginsEffectsOptions';

/**
 * `useSlateProps` options
 */
export interface UseSlatePropsOptions
  extends Pick<UseSlatePluginsEffectsOptions, 'id'> {
  /**
   * Controlled callback called when the editor state changes.
   */
  onChange?: (value: TNode[]) => void;
}
