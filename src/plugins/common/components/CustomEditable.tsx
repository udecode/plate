import React, { useCallback } from 'react';
import { Editable, EditableProps, Plugin, useSlate } from 'slate-react';
import {
  CustomElementProps,
  CustomMarkProps,
} from 'slate-react/lib/components/custom';

interface CustomEditableProps extends EditableProps {
  plugins?: Plugin[];
}

export const CustomEditable = ({
  plugins = [],
  ...props
}: CustomEditableProps) => {
  const editor = useSlate();

  const { renderElement, renderMark, onKeyDown } = props;

  const renderElementPlugins = useCallback(
    (elementProps: CustomElementProps) => {
      let element;
      if (plugins) {
        if (renderElement) {
          element = renderElement(elementProps);
        }

        if (!element) {
          plugins.some(plugin => {
            if (plugin.renderElement) {
              element = plugin.renderElement(elementProps);
              if (element) return true;
            }
            return false;
          });
        }
      }
      if (!element) {
        element = <p {...elementProps.attributes}>{elementProps.children}</p>;
      }

      return element;
    },
    [plugins, renderElement]
  );

  const renderMarkPlugins = useCallback(
    (markProps: CustomMarkProps) => {
      let mark;
      if (plugins) {
        if (renderMark) {
          mark = renderMark(markProps);
        }

        if (!mark) {
          plugins.some(plugin => {
            if (plugin.renderMark) {
              mark = plugin.renderMark(markProps);
              if (mark) return true;
            }
            return false;
          });
        }
      }
      if (!mark) {
        mark = <span {...markProps.attributes}>{markProps.children}</span>;
      }

      return mark;
    },
    [plugins, renderMark]
  );

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
      renderElement={renderElementPlugins}
      renderMark={renderMarkPlugins}
      onKeyDown={onKeyDownPlugins}
    />
  );
};
