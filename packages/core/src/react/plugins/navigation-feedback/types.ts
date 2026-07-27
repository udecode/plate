import type { Anchor, Path, Point, Range } from '@platejs/plite';

import type { PluginConfig } from '../../../lib/plugin';

export const NAVIGATION_FEEDBACK_KEY = 'navigation';

export type NavigationFeedbackTarget = {
  path: Path;
  type: 'node';
};

export type NavigationFeedbackActiveTarget = NavigationFeedbackTarget & {
  cycle: 0 | 1;
  duration: number;
  pulse: number;
  variant: string;
};

export type NavigationFeedbackStoredTarget = Omit<
  NavigationFeedbackActiveTarget,
  'path'
> & {
  pathAnchor: Anchor<Path>;
};

type NavigationFeedbackState = {
  duration: number;
  storedTarget: NavigationFeedbackStoredTarget | null;
};

export type NavigationFlashTargetOptions = {
  duration?: number;
  target: NavigationFeedbackTarget;
  variant?: string;
};

export type NavigationNavigateOptions = {
  flash?:
    | false
    | {
        duration?: number;
        variant?: string;
      };
  focus?: boolean;
  scroll?: boolean;
  scrollTarget?: Point;
  select?: Point | Range;
  target: NavigationFeedbackTarget;
};

export type NavigationFeedbackTx = {
  navigation: {
    clear: () => void;
    flashTarget: (options: NavigationFlashTargetOptions) => boolean;
    navigate: (options: NavigationNavigateOptions) => boolean;
  };
};

export type NavigationFeedbackConfig = PluginConfig<
  typeof NAVIGATION_FEEDBACK_KEY,
  NavigationFeedbackState,
  {},
  NavigationFeedbackTx,
  {
    activeTarget: (
      state: Readonly<NavigationFeedbackState>
    ) => NavigationFeedbackActiveTarget | null;
    isTarget: (state: Readonly<NavigationFeedbackState>, path: Path) => boolean;
  }
>;
