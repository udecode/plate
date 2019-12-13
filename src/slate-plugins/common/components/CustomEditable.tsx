import React from 'react';
import { Editor, NodeEntry, Range } from 'slate';
import {
  Editable,
  OnKeyDown,
  Plugin,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
} from 'slate-react';

interface CustomEditableProps {
  [key: string]: any;
  placeholder?: string;
  readOnly?: boolean;
  role?: string;
  style?: React.CSSProperties;
  plugins?: Plugin[];
  pluginProps?: any;
  decorate?: ((entry: NodeEntry) => Range[])[];
  onDOMBeforeInput?: ((event: Event, editor: Editor) => void)[];
  renderElement?: ((props: RenderElementProps) => JSX.Element | undefined)[];
  renderLeaf?: ((props: RenderLeafProps) => JSX.Element)[];
  onKeyDown?: OnKeyDown[];
}

export const CustomEditable = ({
  plugins = [],
  pluginProps = {},
  decorate: decorateList = [],
  renderElement: renderElementList = [],
  renderLeaf: renderLeafList = [],
  onDOMBeforeInput: onDOMBeforeInputList = [],
  onKeyDown: onKeyDownList = [],
  ...props
}: CustomEditableProps) => {
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

    return <p {...elementProps.attributes}>{elementProps.children}</p>;
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

  const onKeyDownPlugins = (e: any) => {
    onKeyDownList.forEach(onKeyDown => {
      onKeyDown(e, { ...pluginProps, editor });
    });

    plugins.forEach(({ onKeyDown }) => {
      if (!onKeyDown) return;
      onKeyDown(e, { ...pluginProps, editor });
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
