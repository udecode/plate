import React from 'react';
import { NodeEntry, Range } from 'slate';
import {
  Editable,
  EditableProps,
  Plugin,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
} from 'slate-react';

interface CustomEditableProps extends EditableProps {
  plugins?: Plugin[];
  pluginProps?: any;
}

export const CustomEditable = ({
  plugins = [],
  pluginProps = {},
  decorate,
  renderElement,
  renderLeaf,
  onDOMBeforeInput,
  onKeyDown,
  ...props
}: CustomEditableProps) => {
  const editor = useSlate();

  const decoratePlugins = (entry: NodeEntry) => {
    let ranges: Range[] = [];

    if (plugins) {
      if (decorate) {
        ranges = decorate(entry);
      }

      if (!ranges.length) {
        plugins.some(plugin => {
          if (plugin.decorate) {
            ranges = plugin.decorate(entry, pluginProps);
          }
          return ranges.length > 0;
        });
      }
    }

    return ranges;
  };

  const onDOMBeforeInputPlugins = (event: Event) => {
    let element = onDOMBeforeInput && onDOMBeforeInput(event);
    if (element) return;

    plugins.some(plugin => {
      element =
        plugin.onDOMBeforeInput && plugin.onDOMBeforeInput(event, editor);
      return !!element;
    });
  };

  const renderElementPlugins = (elementProps: RenderElementProps) => {
    let element = renderElement && renderElement(elementProps);
    if (element) return element;

    plugins.some(plugin => {
      element = plugin.renderElement && plugin.renderElement(elementProps);
      return !!element;
    });
    if (element) return element;

    return <p {...elementProps.attributes}>{elementProps.children}</p>;
  };

  const renderLeafPlugins = (leafProps: RenderLeafProps) => {
    if (renderLeaf) leafProps.children = renderLeaf(leafProps);

    plugins.forEach(plugin => {
      if (plugin.renderLeaf) leafProps.children = plugin.renderLeaf(leafProps);
    });

    return <span {...leafProps.attributes}>{leafProps.children}</span>;
  };

  const onKeyDownPlugins = (e: any) => {
    if (onKeyDown) onKeyDown(e);

    plugins.forEach(plugin => {
      if (plugin.onKeyDown) {
        plugin.onKeyDown(e, { ...pluginProps, editor });
      }
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
