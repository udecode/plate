export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};

export type WithPartial<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export type WithRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
