export type ListStyleType =
  | 'decimal'
  | 'decimal-bracket'
  | 'decimal-bracket-end'
  | 'lower-alpha'
  | 'lower-alpha-bracket-end'
  | 'lower-roman'
  | 'upper-alpha'
  | 'upper-alpha-bracket-end'
  | 'upper-roman';

export type DocxListStyleType =
  | 'decimal'
  | 'lowerLetter'
  | 'lowerRoman'
  | 'upperLetter'
  | 'upperRoman';

export type ListStyleDefaults = {
  defaultOrderedListStyleType: DocxListStyleType;
};

export type ListStyle = {
  'list-style-type'?: ListStyleType;
};

class ListStyleBuilder {
  private readonly defaults: ListStyleDefaults;

  constructor(defaults?: ListStyleDefaults) {
    this.defaults = defaults || { defaultOrderedListStyleType: 'decimal' };
  }

  getListStyleType(listType: ListStyleType | undefined): DocxListStyleType {
    switch (listType) {
      case 'upper-roman':
        return 'upperRoman';
      case 'lower-roman':
        return 'lowerRoman';
      case 'upper-alpha':
      case 'upper-alpha-bracket-end':
        return 'upperLetter';
      case 'lower-alpha':
      case 'lower-alpha-bracket-end':
        return 'lowerLetter';
      case 'decimal':
      case 'decimal-bracket':
        return 'decimal';
      default:
        return this.defaults.defaultOrderedListStyleType;
    }
  }

  getListPrefixSuffix(
    style: ListStyle | null | undefined,
    lvl: number
  ): string {
    let listType: ListStyleType = this.defaults
      .defaultOrderedListStyleType as ListStyleType;

    if (style?.['list-style-type']) {
      listType = style['list-style-type'];
    }

    switch (listType) {
      case 'upper-roman':
      case 'lower-roman':
      case 'upper-alpha':
      case 'lower-alpha':
        return `%${lvl + 1}.`;
      case 'upper-alpha-bracket-end':
      case 'lower-alpha-bracket-end':
      case 'decimal-bracket-end':
        return `%${lvl + 1})`;
      case 'decimal-bracket':
        return `(%${lvl + 1})`;
      default:
        return `%${lvl + 1}.`;
    }
  }
}

export default ListStyleBuilder;
