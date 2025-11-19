export type TocSideBarProps = {
  open?: boolean;
  rootMargin?: string;
  topOffset?: number;
};

export type UseContentController = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isObserve: boolean;
  rootMargin: string;
  topOffset: number;
};
