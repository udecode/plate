import * as React from 'react';
import { CSSProperties, ReactElement } from 'react';
import { getPlatePluginOptions, PlateEditor } from '@udecode/plate-core';
import {
  isListItemMarkerSelected,
  KEY_LIST,
  ListMarkOptions,
  TransformNodeValueOptions,
  WithListOptions,
} from '@udecode/plate-list';
import {
  getStyledNodeStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { cloneDeep } from 'lodash';
import castArray from 'lodash/castArray';
import { CSSObject } from 'styled-components';
import { useListItemMarkerSelection } from '../hooks';
import { handleListItemMarkerOnMouseDown } from './handleListItemMarkerOnMouseDown';

/**
 * StyledElement with no default styles.
 */
export const OrderedListItemContentElement = (
  props: StyledElementProps
): ReactElement => {
  const {
    attributes,
    children,
    nodeProps,
    className,
    styles,
    element,
    editor,
  } = props;
  const [markerSelection, { setMarkerSelection }] = useListItemMarkerSelection(
    editor?.id
  );

  const selected =
    editor && isListItemMarkerSelected(editor, attributes.ref, markerSelection);

  const options: WithListOptions = editor
    ? getPlatePluginOptions<Required<WithListOptions>>(editor, KEY_LIST)
    : {};
  const { marks, onRenderMarker } = options;

  const MarkerElement =
    onRenderMarker ?? (() => <>{element?.order?.join('.')}.</>);

  const rootStyles = castArray(styles?.root ?? []);
  const nodePropsStyles = nodeProps?.styles?.root?.css ?? [];

  const { root } = getStyledNodeStyles({
    ...nodeProps,
    styles: { root: [...rootStyles, ...nodePropsStyles] },
  });

  const styleProps: CSSObject = root.css.reduce((acc: CSSObject, a) => {
    if (typeof a === 'object') {
      return { ...acc, ...(a as Partial<React.CSSProperties>) };
    }
    return acc;
  }, {} as CSSObject);

  const additionalStyles: Partial<CSSProperties> = marks
    ? marks.reduce((acc: Partial<CSSProperties>, params: ListMarkOptions) => {
        const key = (params.styleKey as string) || (params.nodeKey as string);
        const transform: (
          editor: PlateEditor<{}>,
          params: TransformNodeValueOptions<string | number>
        ) => string | number =
          params.transformNodeValue &&
          typeof params.transformNodeValue === 'function'
            ? params.transformNodeValue
            : (e, { value }: { value: unknown }): string | number => {
                return value as string | number;
              };
        return {
          ...acc,
          [key]: transform(editor, {
            listOptions: options,
            value: element[params.nodeKey],
            currentValue: acc[key],
          }),
        };
      }, {} as CSSProperties)
    : ({} as Partial<CSSProperties>);

  return (
    <div
      style={{
        ...styleProps,
        display: 'flex',
        alignItems: 'flex-start',
      }}
      className={className}
    >
      {element.parentType === 'ol' && (
        <span
          style={{
            userSelect: 'none',
            msUserSelect: 'none',
            paddingRight: '4px',
            ...additionalStyles,
            ...(selected ? { backgroundColor: '#b9d5ff' } : {}),
          }}
          contentEditable={false}
          onMouseDown={(ev) =>
            editor &&
            handleListItemMarkerOnMouseDown(
              ev,
              editor,
              attributes,
              setMarkerSelection
            )
          }
        >
          <MarkerElement order={cloneDeep(element.order)} options={options} />
        </span>
      )}
      <span style={{ display: 'inline-block' }} {...attributes} {...nodeProps}>
        {children}
      </span>
    </div>
  );
};
