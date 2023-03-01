import { DependencyList, useCallback } from 'react';
import { WrapElement } from '@udecode/plate-core/dist/core/src';

/**
 * Returns props with an additional `wrapElement` prop.
 * @see https://github.com/ariakit/ariakit/blob/3c74257c9e/packages/ariakit-utils/src/hooks.ts
 */
export const useWrapElement = <P>(
  props: P & { wrapElement?: WrapElement },
  callback: WrapElement,
  deps: DependencyList = []
): P & { wrapElement: WrapElement } => {
  const wrapElement: WrapElement = useCallback(
    (element) => {
      if (props.wrapElement) {
        element = props.wrapElement(element);
      }
      return callback(element);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, props.wrapElement]
  );

  return { ...props, wrapElement };
};
