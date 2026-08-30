import type { Anchor, Path, Point, Range } from 'plitejs';

export const NAVIGATION_FEEDBACK_NAME = 'navigation';

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

export type NavigationFeedbackPluginState = {
  duration: number;
  target: NavigationFeedbackActiveTarget | null;
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
