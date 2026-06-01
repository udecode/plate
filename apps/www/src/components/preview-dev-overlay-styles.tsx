export function PreviewDevOverlayStyles() {
  return (
    <style
      id="preview-dev-overlay-styles"
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
