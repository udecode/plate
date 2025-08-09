

import { type BlockDisplayProps, BlockDisplay } from "./block-display"

export function ComponentPreview(props: BlockDisplayProps) {

  return <BlockDisplay block={false} {...props} />
}