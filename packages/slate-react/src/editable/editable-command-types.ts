import type { Range } from '@platejs/slate';

export type EditableCommand =
  | { kind: 'format'; format: string }
  | {
      kind: 'delete';
      direction: 'backward' | 'forward';
      unit?: 'block' | 'line' | 'word';
    }
  | { kind: 'delete-both'; unit: 'line' }
  | {
      kind: 'delete-fragment';
      direction?: 'backward' | 'forward';
      selection?: Range | null;
    }
  | { kind: 'history'; direction: 'redo' | 'undo' }
  | { kind: 'insert-break'; variant: 'open-line' | 'paragraph' | 'soft' }
  | { kind: 'insert-data'; data: DataTransfer }
  | { kind: 'insert-text'; inputType?: string; text: string }
  | { kind: 'transpose-character' }
  | {
      kind: 'move-selection';
      axis: 'document' | 'horizontal' | 'line' | 'word';
      extend?: boolean;
      reverse?: boolean;
    }
  | { kind: 'select'; selection: Range }
  | { kind: 'select-all' }
  | { kind: 'set-block'; blockType: string; wrap?: string }
  | { kind: 'toggle-mark'; mark: string };
