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

  const renderElementPlugins = (elementProps: RenderElementProps) => {
    let element;
    if (plugins) {
      element = renderElement && renderElement(elementProps);

      if (!element) {
        plugins.some(plugin => {
          element = plugin.renderElement && plugin.renderElement(elementProps);
          return !!element;
        });
      }
    }
    if (!element) {
      element = <p {...elementProps.attributes}>{elementProps.children}</p>;
    }

    return element;
  };

  const renderLeafPlugins = (leafProps: RenderLeafProps) => {
    let leaf;
    if (plugins) {
      leaf = renderLeaf && renderLeaf(leafProps);

      if (!leaf) {
        plugins.some(plugin => {
          leaf = plugin.renderLeaf && plugin.renderLeaf(leafProps);
          return !!leaf;
        });
      }
    }
    if (!leaf) {
      leaf = <span {...leafProps.attributes}>{leafProps.children}</span>;
    }

    return leaf;
  };

  const onKeyDownPlugins = (e: any) => {
    if (onKeyDown) onKeyDown(e);

    plugins.forEach(plugin => {
      if (plugin.onKeyDown) {
        plugin.onKeyDown(e, editor);
      }
    });
  };

  return (
    <Editable
      {...props}
      decorate={decoratePlugins}
      renderElement={renderElementPlugins}
      renderLeaf={renderLeafPlugins}
      onKeyDown={onKeyDownPlugins}
    />
  );
};
