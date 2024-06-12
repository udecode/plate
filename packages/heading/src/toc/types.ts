import type { Path } from 'slate';

export interface Heading {
  depth: number;
  id: string;
  path: Path;
  title: string;
  type: string;
}

export interface TocSideBarProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  rootMargin?: string;
  showHeader?: boolean;
  style?: React.CSSProperties;
  topOffset?: number;
}

export interface UseContentController {
  containerRef: React.RefObject<HTMLDivElement>;
  isObserve: boolean;
  rootMargin: string;
  topOffset: number;
}
