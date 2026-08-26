import type { Range, Selection } from '@platejs/plite';

export type EditableCommand =
  | {
      kind: 'delete';
      direction: 'backward' | 'forward';
      unit?: 'block' | 'line' | 'word';
    }
  | { kind: 'delete-both'; unit: 'line' }
  | {
      kind: 'delete-fragment';
      direction?: 'backward' | 'forward';
      selection?: Range | Selection;
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
  | { kind: 'select-all' };
