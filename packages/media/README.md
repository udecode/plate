# Plate media plugins

This package implements the media plugins for Plate. It allows inserting
embeddable media such as images, YouTube or Vimeo videos and tweets into your
editor.

Includes:

- caption
- resizable
- media
- image
- iframe

Media plugins own persisted document mutations. Resize UI commits image widths
through the scoped update:

```ts
editor.plugin(ImagePlugin).update.set({ width }, { at: element })
```

`@platejs/resizable` owns preview and clamp math; it does not write editor
nodes.

## Documentation

- Check out [Media](https://platejs.org/docs/media).

## License

[MIT](../../LICENSE)
