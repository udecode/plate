import * as React from 'react';

import type { PliteElementProps } from 'platejs/static';

import { ChevronRight } from 'lucide-react';
import { PliteElement } from 'platejs/static';

export function ToggleElementStatic(props: PliteElementProps) {
  return (
    <PliteElement {...props} className="pl-6">
      <div
        className="-left-0.5 absolute top-0 size-6 cursor-pointer select-none items-center justify-center rounded-md p-px text-muted-foreground transition-colors hover:bg-accent [&_svg]:size-4"
        contentEditable={false}
      >
        <ChevronRight className="rotate-0 transition-transform duration-75" />
      </div>
      {props.children}
    </PliteElement>
  );
}
