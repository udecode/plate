import { TNode } from './slate/TNode';
import { UsePlateEffectsOptions } from './UsePlateEffectsOptions';

/**
 * `useSlateProps` options
 */
export interface UseSlatePropsOptions
  extends Pick<UsePlateEffectsOptions, 'id'> {
  /**
   * Controlled callback called when the editor state changes.
   */
  onChange?: (value: TNode[]) => void;
}
