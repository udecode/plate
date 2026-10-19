export function getCommandMenuSearchState({
  docsSearch,
  inputSearch,
  isQueryLoading,
  minSearchLength,
}: {
  docsSearch: string;
  inputSearch: string;
  isQueryLoading: boolean;
  minSearchLength: number;
}) {
  const docsSearchValue = docsSearch.trim();
  const inputSearchValue = inputSearch.trim();
  const isDocsSearchActive = docsSearchValue.length >= minSearchLength;
  const isInputSearchActive = inputSearchValue.length >= minSearchLength;
  const isPending =
    isInputSearchActive &&
    (inputSearchValue !== docsSearchValue || isQueryLoading);

  return {
    isDocsSearchActive,
    isInputSearchActive,
    isPending,
    shouldShowSearchResults: isDocsSearchActive && !isPending,
  };
}
