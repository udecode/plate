'use client';

import * as React from 'react';

import type { Block, BlockChunk } from '@/registry/schema';

import { cn } from '@udecode/cn';
import { AnimatePresence, motion } from 'framer-motion';

import { BlockCopyButton } from '@/components/block-copy-button';
import { useLiftMode } from '@/hooks/use-lift-mode';

export function BlockChunk({
  block,
  children,
  chunk,
  ...props
}: React.PropsWithChildren<{ block: Block; chunk?: BlockChunk }>) {
  const { isLiftMode } = useLiftMode(block.name);

  if (!chunk) {
    return null;
  }

  return (
    <AnimatePresence>
      {isLiftMode && (
        <motion.div
          key={chunk.name}
          className={cn(
            'group rounded-xl bg-background shadow-xl transition',
            chunk.container?.className
          )}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeIn' }}
          x-chunk-container={chunk.name}
          {...props}
        >
          <div className="relative z-30">{children}</div>
          {chunk.code && (
            <div className="absolute inset-x-0 top-0 z-30 flex px-4 py-3 opacity-0 transition-all duration-200 ease-in group-hover:-translate-y-12 group-hover:opacity-100">
              <div className="flex w-full items-center justify-end gap-2">
                <BlockCopyButton
                  name={chunk.name}
                  code={chunk.code}
                  event="copy_chunk_code"
                />
                {/* <V0Button size="icon" name={chunk.name} /> */}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
