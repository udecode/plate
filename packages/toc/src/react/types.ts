export type TocSideBarProps = {
  open?: boolean;
  rootMargin?: string;
  topOffset?: number;
};

export type UseContentController = {
  container: HTMLElement | null;
  isObserve: boolean;
  rootMargin: string;
  topOffset: number;
};
