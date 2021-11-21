/**
 * Render function interface for providing overrideable render callbacks.
 */
import { AnyObject } from './AnyObject';

export interface RenderFunction<P = AnyObject> {
  (
    props: P,
    defaultRender?: (props?: P) => JSX.Element | null
  ): JSX.Element | null;
}
