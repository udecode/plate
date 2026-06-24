type LoaderProps = {
  error?: Error | null
}

const LoadingError = ({ error }: { error: Error }) => (
  <div className="example-warning">
    <p>An error was thrown while loading this example.</p>
    <pre>
      <code>{error.stack ?? error.message}</code>
    </pre>
  </div>
)

export function ComponentLoader({ error }: LoaderProps) {
  if (error) {
    return <LoadingError error={error} />
  }

  return (
    <div className="loading-container loading-spinner">
      <div className="spinner" />
      <p className="loading-text">Loading example...</p>
    </div>
  )
}

export function HugeDocumentLoader({ error }: LoaderProps) {
  if (error) {
    return <LoadingError error={error} />
  }

  return (
    <div className="loading-container huge-loader-container">
      <div className="spinner" />
      <h2 className="loading-text huge-title">Loading Huge Document</h2>
      <p className="loading-text huge-subtitle">
        Preparing thousands of nodes...
      </p>
    </div>
  )
}
