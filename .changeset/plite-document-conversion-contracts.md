---
'plitejs': major
---

Use explicit versioned persistence, browser data transfer, and schema-fitting contracts.

`EditorValuePersistence<TValue, TEncoded>` directly owns `decode`, `encode`, its positive `version`, and optional `legacyDecoders`. Clipboard and drag/drop integrations register `DataTransferFormat` values: `decode` returns a `ContentSlice` and `encode` returns a string, or `null` to delegate to the next format. A format that throws is reported to `lifecycleErrorSink` and negotiation continues. Schema fitting returns deterministic repair reports and validates detached slices before insertion.

**Migration:** Replace `HostCodec` and host-codec helpers with `DataTransferFormat` and data-transfer format helpers. Declare `decode`, `encode`, `version`, and `legacyDecoders` directly on `persist` instead of wrapping a value codec.
