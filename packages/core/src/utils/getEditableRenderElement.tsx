import React from 'react';
import { castArray } from 'lodash';
import { DefaultElement } from 'slate-react';
import { PlatePluginComponent } from '../types/PlatePluginOptions/PlateOptions';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { PlateRenderElementProps } from '../types/PlateRenderElementProps';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderElement` handler for `options.type`.
 * If the type is equals to the slate element type, render `options.component`.
 * Else, return `undefined` so the pipeline can check the next plugin.
 */
export const getEditableRenderElement = (options: RenderNodeOptions[]) => (
  props: PlateRenderElementProps
) => {
  const { plugins } = props;

  const _options = castArray<RenderNodeOptions>(options);

  const injectParentComponents = plugins.flatMap(
    (o) => o.injectParentComponent ?? []
  );
  const injectChildComponents = plugins.flatMap(
    (o) => o.injectChildComponent ?? []
  );

  for (const option of _options) {
    const {
      type,
      component: Element = DefaultElement as PlatePluginComponent,
      getNodeProps,
      overrideProps,
    } = option;

    const { element, children: _children } = props;

    if (element.type === type) {
      const nodeProps = getRenderNodeProps({
        attributes: element.attributes,
        getNodeProps,
        overrideProps,
        props,
        type,
      });

      let children = _children;

      injectChildComponents.forEach((withHOC) => {
        const hoc = withHOC({ ...nodeProps, ...option });

        if (hoc) {
          children = hoc({ ...nodeProps, children });
        }
      });

      let component: JSX.Element | null = (
        <Element {...nodeProps}>{children}</Element>
      );

      injectParentComponents.forEach((withHOC) => {
        const hoc = withHOC({ ...nodeProps, ...option });

        if (hoc) {
          component = hoc({ ...nodeProps, children: component });
        }
      });

      return component;
    }
  }
};
