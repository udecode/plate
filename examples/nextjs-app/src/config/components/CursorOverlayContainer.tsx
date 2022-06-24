import { CursorOverlay, CursorOverlayProps } from '@udecode/plate'
import { cursorStore } from '../plugins'

export const CursorOverlayContainer = (props: CursorOverlayProps) => {
  const cursors = cursorStore.use.cursors()

  return <CursorOverlay {...props} cursors={cursors} />
}
