export interface TocSideBarProps {
  open?: boolean;
  rootMargin?: string;
  topOffset?: number;
}

export interface UseContentController {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isObserve: boolean;
  rootMargin: string;
  topOffset: number;
}
