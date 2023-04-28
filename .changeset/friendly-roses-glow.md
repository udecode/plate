---
'@udecode/plate-serializer-csv': minor
---

- Make papaparse options customisable using `parseOptions` plugin option.
  ```ts
    createDeserializeCsvPlugin({
      options: {
        parseOptions: {
          header: false,
        },
      },
    }),
  ```
- Options can also be passed directly to `deserializeCsv` as follows: `deserializeCsv({ data, headers: true })`.
