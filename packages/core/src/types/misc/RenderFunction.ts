/**
 * Render function interface for providing overrideable render callbacks.
 */
import { AnyObject } from '@udecode/slate';

export interface RenderFunction<P = AnyObject> {
  (
    props: P,
    defaultRender?: (props?: P) => JSX.Element | null
  ): JSX.Element | null;
}
