'use client';

import React from 'react';

import type { TCodeBlockElement } from '@udecode/plate-code-block';
import type { StaticElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';

import './code-block-element.css';

// export const CodeBlockElement = withRef<typeof PlateElement>(
//   ({ children, className, ...props }, ref) => {
//     const { element } = props;

//     const state = useCodeBlockElementState({ element });

//     return (
//       <PlateElement
//         ref={ref}
//         className={cn('relative py-1', className)}
//         {...props}
//       >
//         <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 font-mono text-sm leading-[normal] [tab-size:2]">
//           <code>{children}</code>
//         </pre>

//         {state.syntax && (
//           <div
//             className="absolute right-2 top-2 z-10 select-none"
//             contentEditable={false}
//           >
//             <CodeBlockCombobox />
//           </div>
//         )}
//       </PlateElement>
//     );
//   }
// );

export const CodeBlockElementStatic = (
  props: StaticElementProps<TCodeBlockElement>
) => {
  const { attributes, children, element } = props;

  const codeClassName = element?.lang
    ? `${element.lang} language-${element.lang}`
    : '';

  return (
    <div className={cn('relative py-1', codeClassName)} {...attributes}>
      <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 font-mono text-sm leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>
    </div>
  );
};
