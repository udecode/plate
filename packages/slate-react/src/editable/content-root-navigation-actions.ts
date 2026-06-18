import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Hotkeys } from '@platejs/slate-dom';

import type { EditableCommand } from './editable-command-types';

export type ContentRootNavigationDirection = 'backward' | 'forward';
export type ContentRootNavigationAxis =
  | 'horizontal'
  | 'line'
  | 'vertical'
  | 'word';

export type ContentRootNavigationAction =
  | {
      direction: ContentRootNavigationDirection;
      kind: 'document-boundary';
    }
  | {
      kind: 'enter';
    }
  | {
      axis: ContentRootNavigationAxis;
      direction: ContentRootNavigationDirection;
      kind: 'move';
    };

export type ContentRootViewSelectionAction =
  | {
      axis: ContentRootNavigationAxis;
      direction: ContentRootNavigationDirection;
      kind: 'move';
    }
  | {
      direction: ContentRootNavigationDirection;
      kind: 'document-boundary';
    };

export type ContentRootSelectionMoveCommand = Extract<
  EditableCommand,
  { kind: 'move-selection' }
>;

const getDocumentDirection = ({
  event,
  isRTL,
}: {
  event: ReactKeyboardEvent<HTMLDivElement>;
  isRTL: boolean;
}): ContentRootNavigationDirection | null => {
  const { nativeEvent } = event;

  if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
    return null;
  }

  if (Hotkeys.isMoveBackward(nativeEvent)) {
    return isRTL ? 'forward' : 'backward';
  }

  if (Hotkeys.isMoveForward(nativeEvent)) {
    return isRTL ? 'backward' : 'forward';
  }

  if (Hotkeys.isDeleteBackward(nativeEvent)) {
    return 'backward';
  }

  if (Hotkeys.isDeleteForward(nativeEvent)) {
    return 'forward';
  }

  return null;
};

const getWordDirection = ({
  event,
  isRTL,
}: {
  event: ReactKeyboardEvent<HTMLDivElement>;
  isRTL: boolean;
}): ContentRootNavigationDirection | null => {
  const { nativeEvent } = event;

  if (Hotkeys.isMoveWordBackward(nativeEvent)) {
    return isRTL ? 'forward' : 'backward';
  }

  if (Hotkeys.isMoveWordForward(nativeEvent)) {
    return isRTL ? 'backward' : 'forward';
  }

  return null;
};

const isPlainContentRootEvent = (event: ReactKeyboardEvent<HTMLDivElement>) =>
  !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey;

const isEnterIntoContentRoot = (event: ReactKeyboardEvent<HTMLDivElement>) => {
  const { nativeEvent } = event;

  return isPlainContentRootEvent(event) && Hotkeys.isSplitBlock(nativeEvent);
};

export const getContentRootNavigationAction = ({
  event,
  isRTL,
}: {
  event: ReactKeyboardEvent<HTMLDivElement>;
  isRTL: boolean;
}): ContentRootNavigationAction | null => {
  if (event.metaKey && !event.shiftKey && !event.altKey && !event.ctrlKey) {
    if (event.key === 'ArrowUp') {
      return { direction: 'backward', kind: 'document-boundary' };
    }

    if (event.key === 'ArrowDown') {
      return { direction: 'forward', kind: 'document-boundary' };
    }
  }

  if (isEnterIntoContentRoot(event)) {
    return { kind: 'enter' };
  }

  const wordDirection = getWordDirection({ event, isRTL });

  if (wordDirection) {
    return { axis: 'word', direction: wordDirection, kind: 'move' };
  }

  const direction = getDocumentDirection({ event, isRTL });

  if (direction) {
    return { axis: 'horizontal', direction, kind: 'move' };
  }

  if (!isPlainContentRootEvent(event)) {
    return null;
  }

  if (event.key === 'ArrowUp') {
    return { axis: 'vertical', direction: 'backward', kind: 'move' };
  }

  if (event.key === 'ArrowDown') {
    return { axis: 'vertical', direction: 'forward', kind: 'move' };
  }

  return null;
};

export const getProjectedSelectionAction = ({
  event,
  isRTL,
}: {
  event: ReactKeyboardEvent<HTMLDivElement>;
  isRTL: boolean;
}): ContentRootViewSelectionAction | null => {
  if (Hotkeys.isExtendWordBackward(event.nativeEvent)) {
    return {
      axis: 'word',
      direction: isRTL ? 'forward' : 'backward',
      kind: 'move',
    };
  }

  if (Hotkeys.isExtendWordForward(event.nativeEvent)) {
    return {
      axis: 'word',
      direction: isRTL ? 'backward' : 'forward',
      kind: 'move',
    };
  }

  if (Hotkeys.isExtendLineBackward(event.nativeEvent)) {
    return { axis: 'vertical', direction: 'backward', kind: 'move' };
  }

  if (Hotkeys.isExtendLineForward(event.nativeEvent)) {
    return { axis: 'vertical', direction: 'forward', kind: 'move' };
  }

  if (event.shiftKey && event.metaKey && !event.altKey && !event.ctrlKey) {
    if (event.key === 'ArrowLeft') {
      return {
        axis: 'line',
        direction: isRTL ? 'forward' : 'backward',
        kind: 'move',
      };
    }

    if (event.key === 'ArrowRight') {
      return {
        axis: 'line',
        direction: isRTL ? 'backward' : 'forward',
        kind: 'move',
      };
    }
  }

  if (!event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
    if (event.shiftKey && event.metaKey && !event.altKey && !event.ctrlKey) {
      if (event.key === 'ArrowUp') {
        return { direction: 'backward', kind: 'document-boundary' };
      }

      if (event.key === 'ArrowDown') {
        return { direction: 'forward', kind: 'document-boundary' };
      }
    }

    return null;
  }

  if (event.key === 'ArrowUp') {
    return { axis: 'vertical', direction: 'backward', kind: 'move' };
  }

  if (event.key === 'ArrowDown') {
    return { axis: 'vertical', direction: 'forward', kind: 'move' };
  }

  if (event.key === 'ArrowLeft') {
    return {
      axis: 'horizontal',
      direction: isRTL ? 'forward' : 'backward',
      kind: 'move',
    };
  }

  if (event.key === 'ArrowRight') {
    return {
      axis: 'horizontal',
      direction: isRTL ? 'backward' : 'forward',
      kind: 'move',
    };
  }

  return null;
};

export const getProjectedSelectionActionFromMoveCommand = ({
  command,
  isRTL,
}: {
  command: ContentRootSelectionMoveCommand;
  isRTL: boolean;
}): ContentRootViewSelectionAction | null => {
  if (!command.extend) {
    return null;
  }

  if (command.axis === 'document') {
    return {
      direction: command.reverse ? 'backward' : 'forward',
      kind: 'document-boundary',
    };
  }

  const direction = command.reverse
    ? isRTL
      ? 'forward'
      : 'backward'
    : isRTL
      ? 'backward'
      : 'forward';

  return {
    axis: command.axis === 'line' ? 'vertical' : command.axis,
    direction,
    kind: 'move',
  };
};
