export type NoInfer<T> = [T][T extends any ? 0 : never];
