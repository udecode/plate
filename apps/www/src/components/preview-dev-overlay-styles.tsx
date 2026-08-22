export function PreviewDevOverlayStyles() {
  return (
    <style
      id="preview-dev-overlay-styles"
      // oxlint-disable-next-line react/no-danger -- [P0 behavior-boundary] This component owns a fixed repository stylesheet with no external input.
      dangerouslySetInnerHTML={{
        __html: `
          [data-tailwind-indicator],
          nextjs-portal,
          [data-nextjs-dev-tools-button],
          [data-nextjs-dev-tools],
          [data-feedback-toolbar],
          [data-agentation-root],
          [data-agentation-settings-panel] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `,
      }}
    />
  );
}
