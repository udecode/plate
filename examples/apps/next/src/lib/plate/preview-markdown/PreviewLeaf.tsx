import React from 'react';
import { cn, TRenderLeafProps, TText } from '@udecode/plate';
import { MyValue } from '../../apps/next/src/lib/plate/typescript/plateTypes';

export function PreviewLeaf({
  attributes,
  leaf,
  children,
}: TRenderLeafProps<
  MyValue,
  TText & {
    title?: boolean;
    list?: boolean;
    italic?: boolean;
    hr?: boolean;
    code?: boolean;
    bold?: boolean;
    blockquote?: boolean;
  }
>) {
  const { title, list, italic, hr, code, bold, blockquote } = leaf;

  return (
    <span
      {...attributes}
      className={cn(
        bold && 'font-bold',
        italic && 'italic',
        title && 'mx-0 mb-2.5 mt-5 inline-block text-[20px] font-bold',
        list && 'pl-2.5 text-[20px] leading-[10px]',
        hr && 'block border-b-2 border-[#ddd] text-center',
        blockquote &&
          'inline-block border-l-2 border-[#ddd] pl-2.5 italic text-[#aaa]',
        code && 'bg-[#eee] p-[3px] font-mono'
      )}
    >
      {children}
    </span>
  );
}
