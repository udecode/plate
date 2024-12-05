import type { TCodeBlockElement } from '@udecode/plate-code-block';
import type { StaticElementProps } from '@udecode/plate-core';

import { cn } from '../lib/utils';

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
