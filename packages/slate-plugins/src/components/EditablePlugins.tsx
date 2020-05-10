import React from 'react';
import {
  Decorate,
  OnDOMBeforeInput,
  OnKeyDown,
  RenderElement,
  RenderLeaf,
  SlatePlugin,
} from 'common/types';
import { Editable, useSlate } from 'slate-react';
import {
  decoratePlugins,
  onDOMBeforeInputPlugins,
  onKeyDownPlugins,
  renderElementPlugins,
  renderLeafPlugins,
} from 'components/utils';

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

  return (
    <Editable
      style={{
        fontSize: 16,
        lineHeight: 26,
      }}
      data-testid="EditablePlugins"
      decorate={decoratePlugins(plugins, decorateList)}
      onDOMBeforeInput={onDOMBeforeInputPlugins(
        editor,
        plugins,
        onDOMBeforeInputList
      )}
      renderElement={renderElementPlugins(plugins, renderElementList)}
      renderLeaf={renderLeafPlugins(plugins, renderLeafList)}
      onKeyDown={onKeyDownPlugins(editor, plugins, onKeyDownList)}
      {...props}
    />
  );
};
