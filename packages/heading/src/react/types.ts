export interface TocSideBarProps {
  open?: boolean;
  rootMargin?: string;
  topOffset?: number;
}

export interface UseContentController {
  containerRef: React.RefObject<HTMLDivElement>;
  isObserve: boolean;
  rootMargin: string;
  topOffset: number;
}
