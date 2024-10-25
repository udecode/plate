export function truncateSystemPrompt(systemPrompt: string, maxChars: number) {
  if (systemPrompt.length <= maxChars) return systemPrompt;

  // Find the position of <Block> and <Selection> tags
  const blockStart = systemPrompt.indexOf('<Block>');
  const selectionStart = systemPrompt.indexOf('<Selection>');

  if (blockStart === -1 || selectionStart === -1) {
    // If tags are not found, simple truncation
    return systemPrompt.slice(0, maxChars - 3) + '...';
  }

  // Preserve the structure and truncate content within tags if necessary
  const prefix = systemPrompt.slice(0, blockStart);
  const blockContent = systemPrompt.slice(blockStart, selectionStart);
  const selectionContent = systemPrompt.slice(selectionStart);

  const availableChars = maxChars - prefix.length - 6; // 6 for '...' in both block and selection
  const halfAvailable = availableChars / 2;

  const truncatedBlock =
    blockContent.length > halfAvailable
      ? blockContent.slice(0, halfAvailable - 3) + '...'
      : blockContent;

  const truncatedSelection =
    selectionContent.length > availableChars - truncatedBlock.length
      ? selectionContent.slice(0, availableChars - truncatedBlock.length - 3) +
        '...'
      : selectionContent;

  return prefix + truncatedBlock + truncatedSelection;
}
