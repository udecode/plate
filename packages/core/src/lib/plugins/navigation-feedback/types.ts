import type { Path, PathRef, Point, TRange } from '@platejs/slate';

import type { PluginConfig } from '../../plugin';

export const NAVIGATION_FEEDBACK_KEY = 'navigationFeedback';
export const NavigationFeedbackPluginKey = {
  key: NAVIGATION_FEEDBACK_KEY,
} as const;

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
  pathRef: PathRef;
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
  select?: Point | TRange;
  target: NavigationFeedbackTarget;
};

export type NavigationFeedbackConfig = PluginConfig<
  typeof NAVIGATION_FEEDBACK_KEY,
  {
    activeTarget: NavigationFeedbackStoredTarget | null;
    duration: number;
  },
  {
    navigation: {
      activeTarget: () => NavigationFeedbackActiveTarget | null;
      clear: () => void;
      isTarget: (path: Path) => boolean;
    };
  },
  {
    navigation: {
      clear: () => void;
      flashTarget: (options: NavigationFlashTargetOptions) => boolean;
      navigate: (options: NavigationNavigateOptions) => boolean;
    };
  }
>;
