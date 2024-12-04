import type { SlateEditor, SlatePlugin } from '@udecode/plate-common';
import type { TRenderLeafProps } from '@udecode/plate-common/react';

import { decode } from 'html-entities';

// 处理属性
const serializeAttributes = (attrs: Record<string, any>): string => {
  return Object.entries(attrs)
    .filter(([_, value]) => value != null)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
};

// 将组件props转换为HTML属性
const propsToAttributes = (props: any): Record<string, string> => {
  const attributes: Record<string, string> = {};

  Object.entries(props).forEach(([key, value]) => {
    // 处理文本节点的特殊属性
    if (key === 'leaf') {
      // 从leaf中提取样式属性
      Object.entries(value).forEach(([leafKey, leafValue]) => {
        if (typeof leafValue === 'boolean' && leafValue) {
          switch (leafKey) {
            case 'bold': {
              attributes.style =
                (attributes.style || '') + 'font-weight: bold;';

              break;
            }
            case 'italic': {
              attributes.style =
                (attributes.style || '') + 'font-style: italic;';

              break;
            }
            case 'strikethrough': {
              attributes.style =
                (attributes.style || '') + 'text-decoration: line-through;';

              break;
            }
            case 'underline': {
              attributes.style =
                (attributes.style || '') + 'text-decoration: underline;';

              break;
            }
            // 可以添加更多文本样式处理
          }
        }
      });
    } else if (key === 'attributes') {
      // 合并直接的HTML属性
      Object.assign(attributes, value);
    }
  });

  return attributes;
};

// 渲染静态文本组件
const renderStaticLeaf = (Component: any, props: any): string => {
  const attributes = propsToAttributes(props);
  const attributeString = serializeAttributes(attributes);
  const children = props.children || '';

  return attributeString
    ? `<span ${attributeString}>${children}</span>`
    : `<span>${children}</span>`;
};

// 增强的leafToHtml函数
const leafToHtml = (
  editor: SlateEditor,
  { props }: { props: TRenderLeafProps }
): string => {
  const { leaf } = props;
  let html = '';

  // 查找匹配的插件
  editor.pluginList.some((plugin: SlatePlugin) => {
    if (!plugin.node.staticComponent || !plugin.node.isLeaf) {
      return false;
    }

    try {
      // 创建叶子节点的props
      const leafProps = {
        attributes: props.attributes,
        children: props.children,
        leaf,
        text: props.text,
      };

      // 使用插件的静态组件进行渲染
      const Component = plugin.node.staticComponent;
      html = decode(renderStaticLeaf(Component, leafProps));

      return true;
    } catch (error) {
      console.error('Error rendering leaf component:', error);

      return false;
    }
  });

  // 如果没有找到匹配的插件，使用默认渲染
  if (!html) {
    const defaultProps = {
      attributes: props.attributes || {},
      children: props.children,
      leaf,
    };

    // 处理默认的文本修饰
    if (leaf) {
      if (leaf.bold) defaultProps.attributes['data-slate-bold'] = 'true';
      if (leaf.italic) defaultProps.attributes['data-slate-italic'] = 'true';
      if (leaf.underline)
        defaultProps.attributes['data-slate-underline'] = 'true';
      if (leaf.code) defaultProps.attributes['data-slate-code'] = 'true';
    }

    html = renderStaticLeaf(null, defaultProps);
  }

  return html;
};

export { leafToHtml };
