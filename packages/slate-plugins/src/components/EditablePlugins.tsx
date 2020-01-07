import React from 'react';
import { NodeEntry, Range } from 'slate';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
} from 'slate-react';
import {
  Decorate,
  OnDOMBeforeInput,
  OnKeyDown,
  RenderElement,
  RenderLeaf,
  SlatePlugin,
} from 'types';

interface Props {
  [key: string]: any;
  placeholder?: string;
  readOnly?: boolean;
  role?: string;
  style?: React.CSSProperties;
  plugins?: SlatePlugin[];
  decorate?: Decorate[];
  onDOMBeforeInput?: OnDOMBeforeInput[];
  renderElement?: RenderElement[];
  renderLeaf?: RenderLeaf[];
  onKeyDown?: OnKeyDown[];
}

export const EditablePlugins = ({
  plugins = [],
  decorate: decorateList = [],
  renderElement: renderElementList = [],
  renderLeaf: renderLeafList = [],
  onDOMBeforeInput: onDOMBeforeInputList = [],
  onKeyDown: onKeyDownList = [],
  ...props
}: Props) => {
  const editor = useSlate();

  const decoratePlugins = (entry: NodeEntry) => {
    let ranges: Range[] = [];

    decorateList.forEach(decorate => {
      const newRanges = decorate(entry) || [];
      if (newRanges.length) ranges = [...ranges, ...newRanges];
    });

    plugins.forEach(plugin => {
      if (!plugin.decorate) return;

      const newRanges = plugin.decorate(entry) || [];
      if (newRanges.length) ranges = [...ranges, ...newRanges];
    });

    return ranges;
  };

  const onDOMBeforeInputPlugins = (event: Event) => {
    onDOMBeforeInputList.forEach(onDOMBeforeInput => {
      onDOMBeforeInput(event, editor);
    });

    plugins.forEach(({ onDOMBeforeInput }) => {
      if (!onDOMBeforeInput) return;
      onDOMBeforeInput(event, editor);
    });
  };

  const renderElementPlugins = (elementProps: RenderElementProps) => {
    let element;

    renderElementList.some(renderElement => {
      element = renderElement(elementProps);
      return !!element;
    });
    if (element) return element;

    plugins.some(({ renderElement }) => {
      element = renderElement && renderElement(elementProps);
      return !!element;
    });
    if (element) return element;

    return <div {...elementProps.attributes}>{elementProps.children}</div>;
  };

  const renderLeafPlugins = (leafProps: RenderLeafProps) => {
    renderLeafList.forEach(renderLeaf => {
      leafProps.children = renderLeaf(leafProps);
    });

    plugins.forEach(({ renderLeaf }) => {
      if (!renderLeaf) return;
      leafProps.children = renderLeaf(leafProps);
    });

    return <span {...leafProps.attributes}>{leafProps.children}</span>;
  };

  const onKeyDownPlugins = (event: any) => {
    onKeyDownList.forEach(onKeyDown => {
      onKeyDown(event, editor);
    });

    plugins.forEach(({ onKeyDown }) => {
      if (!onKeyDown) return;
      onKeyDown(event, editor);
    });
  };

  return (
    <Editable
      {...props}
      decorate={decoratePlugins}
      onDOMBeforeInput={onDOMBeforeInputPlugins}
      renderElement={renderElementPlugins}
      renderLeaf={renderLeafPlugins}
      onKeyDown={onKeyDownPlugins}
    />
  );
};
