import { useEditorRef, useEditorSelector } from '@udecode/plate-core/react';
import { FontSizePlugin } from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import {
  type TElement,
  type TText,
  getAboveNode,
  getMarks,
  getNodeEntry,
} from '@udecode/slate';
import { focusEditor, toDOMNode } from '@udecode/slate-react';
import { setMarks } from '@udecode/slate-utils';
import { Minus, Plus } from 'lucide-react';

import { ToolbarButton } from './toolbar';

const FONT_SIZE_MAP = {
  [HEADING_KEYS.h1]: '36px',
  [HEADING_KEYS.h2]: '24px',
  [HEADING_KEYS.h3]: '20px',
};

export const FontSizeToolbarButton = () => {
  const fontSize = useEditorSelector((editor) => {
    const marks = getMarks(editor) || {};

    if (marks[FontSizePlugin.key]) return marks[FontSizePlugin.key];

    const entry = getAboveNode<TElement>(editor, {
      at: editor.selection?.focus,
    });

    if (!entry) return '16px';

    const [node] = entry;

    if (node.type in FONT_SIZE_MAP)
      return FONT_SIZE_MAP[node.type as keyof typeof FONT_SIZE_MAP];

    return '16px';
  }, []);

  const editor = useEditorRef();

  const getFontSize = (textNode: TText): string => {
    const fontSize = textNode[FontSizePlugin.key];

    if (typeof fontSize === 'string') return fontSize;

    const dom = toDOMNode(editor, textNode);

    return window.getComputedStyle(dom as HTMLSpanElement).fontSize;
  };

  const getIncreasedFontSize = (fontSize: string): string => {
    // 如果输入为空返回默认值
    if (!fontSize) return '16px';

    // 提取数字和单位
    const match = /^([\d.]+)([%a-z]*)$/i.exec(fontSize);

    if (!match) return fontSize;

    const [, value, unit] = match;
    const numericValue = Number.parseFloat(value);

    // 相对长度单位的增加比例
    const relativeUnits: Record<string, number> = {
      '%': 12.5, // 百分比
      cap: 0.125, // 相对于大写字母的高度
      ch: 0.5, // 相对于数字"0"的宽度
      em: 0.125, // 相对于父元素的字体大小
      ex: 0.25, // 相对于字符'x'的高度
      ic: 0.125, // 相对于表意字符的宽度
      lh: 0.125, // 相对于行高
      rem: 0.125, // 相对于根元素的字体大小
      rlh: 0.125, // 相对于根元素的行高
    };

    // 绝对长度单位的增加值
    const absoluteUnits: Record<string, number> = {
      Q: 1.28, // 四分之一毫米
      cm: 0.032, // 厘米
      in: 0.0125, // 英寸
      mm: 0.32, // 毫米
      pc: 0.125, // 派卡
      pt: 1.5, // 点
      px: 2, // 像素
    };

    // 视口相关单位的增加比例
    const viewportUnits: Record<string, number> = {
      dvb: 0.125, // 动态视口块方向尺寸的1%
      dvh: 0.125, // 动态视口高度的1%
      dvi: 0.125, // 动态视口内联方向尺寸的1%
      dvmax: 0.125, // 动态视口较大尺寸的1%
      dvmin: 0.125, // 动态视口较小尺寸的1%
      dvw: 0.125, // 动态视口宽度的1%
      vb: 0.125, // 视口块方向尺寸的1%
      vh: 0.125, // 视口高度的1%
      vi: 0.125, // 视口内联方向尺寸的1%
      vmax: 0.125, // 视口较大尺寸的1%
      vmin: 0.125, // 视口较小尺寸的1%
      vw: 0.125, // 视口宽度的1%
    };

    // 容器查询单位的增加比例
    const containerUnits: Record<string, number> = {
      cqb: 0.125, // 容器查询块尺寸的1%
      cqh: 0.125, // 容器查询高度的1%
      cqi: 0.125, // 容器查询内联尺寸的1%
      cqmax: 0.125, // 容器查询较大尺寸的1%
      cqmin: 0.125, // 容器查询较小尺寸的1%
      cqw: 0.125, // 容器查询宽度的1%
    };

    // 合并所有单位的处理规则
    const allUnits = {
      ...relativeUnits,
      ...absoluteUnits,
      ...viewportUnits,
      ...containerUnits,
    };

    if (unit in allUnits) {
      const increment = allUnits[unit];

      // 对于绝对单位直接加上增量，对于相对单位增加相应比例
      const newValue =
        unit in absoluteUnits
          ? numericValue + increment
          : numericValue * (1 + increment);

      // 移除末尾的零和不必要的小数点
      return `${Number(newValue.toFixed(3))}${unit}`;
    }

    // 对于未知单位，返回原值
    return fontSize;
  };

  const onIncreaseFontSize = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!editor.selection) return;

    const entry = getNodeEntry<TText>(editor, editor.selection.focus);

    if (!entry) return;

    const [text] = entry;

    const fontSize = getFontSize(text);

    setMarks(editor, { [FontSizePlugin.key]: getIncreasedFontSize(fontSize) });

    focusEditor(editor);
  };

  const onDecreaseFontSize = () => {};

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted/70 p-0">
      <ToolbarButton onClick={onIncreaseFontSize}>
        <Plus />
      </ToolbarButton>
      <ToolbarButton>{fontSize as string}</ToolbarButton>
      <ToolbarButton onClick={onDecreaseFontSize}>
        <Minus />
      </ToolbarButton>
    </div>
  );
};
