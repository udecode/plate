import type React from 'react';

import type {
  AnyBasePluginDefinition,
  HandlerReturnType,
  BasePluginDefinition,
} from '../../lib';
import type { DOMHandlerProp } from '../utils/dom-attributes.internal';
import type { PlatePluginContext } from './PlatePlugin';

export type DOMHandler<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  EV = {},
> = (
  ctx: PlatePluginContext<C> & {
    event: EV;
  }
) => HandlerReturnType;

export type DOMHandlers<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = {
  [
    K in DOMHandlerProp as K extends 'onDOMBeforeInput'
      ? 'domBeforeInput'
      : K extends `on${infer Name}`
        ? Uncapitalize<Name>
        : never
  ]?: DOMHandler<
    C,
    K extends 'onDOMBeforeInput'
      ? Event
      : K extends keyof React.DOMAttributes<Element>
        ? Parameters<NonNullable<React.DOMAttributes<Element>[K]>>[0]
        : never
  >;
};
