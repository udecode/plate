import type { Block } from '@/registry/schema';

import { cn } from '@udecode/cn';

import PlaygroundDemo from '@/registry/default/example/playground-demo';

const block: Block = {
  code: '',
  highlightedCode: '',
  name: 'playground',
  type: 'registry:block',
};

export default function PlaygroundPage() {
  return (
    <div
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className={cn('themes-wrapper bg-background', block.container?.className)}
    >
      {/* <BlockWrapper block={block}> */}
      <PlaygroundDemo className="[&_[data-slate-editor]]:max-h-none" />
      {/* {chunks?.map((chunk, index) => (
          <BlockChunk
            key={chunk.name}
            block={block}
            chunk={block.chunks?.[index]}
          >
            <chunk.component />
          </BlockChunk>
        ))} */}
      {/* </BlockWrapper> */}
    </div>
  );
}
