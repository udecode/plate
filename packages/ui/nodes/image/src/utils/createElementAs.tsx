import React, { ElementType, ReactElement } from 'react';
import { AsProps, HTMLProps, RenderProp } from './types';

function isRenderProp(children: any): children is RenderProp {
  return typeof children === 'function';
}

/**
 * Creates a React element that supports the `as` prop, children as a
 * function (render props) and a `wrapElement` function.
 *
 * @example
 * import { createElement } from "ariakit-utils/system";
 *
 * function Component() {
 *   const props = {
 *     as: "button" as const,
 *     children: (htmlProps) => <button {...htmlProps} />,
 *     wrapElement: (element) => <div>{element}</div>,
 *   };
 *   return createElement("div", props);
 * }
 */
export function createElementAs(Type: ElementType, props: HTMLProps<AsProps>) {
  const { as: As, wrapElement, ...rest } = props;
  let element: ReactElement;
  if (As && typeof As !== 'string') {
    element = <As {...rest} />;
  } else if (isRenderProp(props.children)) {
    const { children, ...otherProps } = rest;
    element = props.children(otherProps) as ReactElement;
  } else if (As) {
    element = <As {...rest} />;
  } else {
    element = <Type {...rest} />;
  }
  if (wrapElement) {
    return wrapElement(element);
  }
  return element;
}
