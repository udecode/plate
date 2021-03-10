export interface WithListOptions {
  /**
   * Valid children types for list items, in addition to p and ul types.
   */
  validLiChildrenTypes?: string[];
}

export interface ListNormalizerOptions
  extends Pick<WithListOptions, 'validLiChildrenTypes'> {}
