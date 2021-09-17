import * as React from 'react';
import { castArray } from 'lodash';
import { DefaultElement } from 'slate-react';
import { PlatePluginComponent } from '../types/PlatePluginOptions/PlateOptions';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { TRenderElementProps } from '../types/TRenderElementProps';
import { getSlateClass } from './getSlateClass';

/**
 * Get a `Editable.renderElement` handler for `options.type`.
 * If the type is equals to the slate element type, render `options.component`.
 * Else, return `undefined` so the pipeline can check the next plugin.
 */
export const getEditableRenderElement = (
  options: RenderNodeOptions | RenderNodeOptions[]
) => ({ attributes, element, children }: TRenderElementProps) => {
  const renderNodeProps = { attributes, element, children };

  const _options = castArray<RenderNodeOptions>(options);

  for (const option of _options) {
    const {
      type,
      component: Element = DefaultElement as PlatePluginComponent,
      getNodeProps,
      overrideProps,
    } = option;

    if (element.type === type) {
      const nodeProps =
        getNodeProps?.(renderNodeProps) ?? element.attributes ?? {};

      let props: any = {};

      if (overrideProps) {
        props =
          typeof overrideProps === 'function'
            ? overrideProps(renderNodeProps)
            : overrideProps;
      }

      return (
        <Element
          className={getSlateClass(type)}
          attributes={attributes}
          element={element}
          nodeProps={nodeProps}
          {...props}
        >
          {children}
        </Element>
      );
    }
  }
};
