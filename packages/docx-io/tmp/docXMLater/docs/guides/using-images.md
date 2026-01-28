# Using Images in DocXML

This guide explains how to work with images in DocXML, including basic usage, advanced features, and best practices.

## Basic Usage

### Creating an Image from a File

```typescript
const image = await Image.fromFile('path/to/image.png', {
  width: inchesToEmus(3),
  height: inchesToEmus(2),
  description: 'Sample image'
});
doc.addImage(image);
```

### Creating an Image from a Buffer

```typescript
const buffer = fs.readFileSync('path/to/image.png');
const image = await Image.fromBuffer(buffer, {
  width: inchesToEmus(3),
  height: inchesToEmus(2)
});
doc.addImage(image);
```

## Resizing Images

```typescript
image.setWidth(inchesToEmus(4), true); // Maintain aspect ratio
image.setHeight(inchesToEmus(2), true);
image.setSize(inchesToEmus(4), inchesToEmus(2)); // Set exact size
```

## Floating Images

Use convenience methods to position images:

```typescript
image.floatTopLeft(inchesToEmus(0.5), inchesToEmus(0.5));
image.floatTopRight();
image.floatCenter();
image.setBehindText(true);
```

## Visual Effects and Cropping

```typescript
image.setEffects({
  brightness: 20,
  contrast: 10,
  grayscale: true
});
image.setCrop(10, 10, 10, 10); // Percentage-based cropping
```

## Validation and DPI

```typescript
const validation = image.validateImageData();
if (!validation.valid) {
  console.error(validation.error);
}
console.log('DPI:', image.getDPI());
```

## Advanced Properties

- Set rotation: `image.rotate(45);`
- Set alt text: `image.setAltText('Description');`
- Update image data: `await image.updateImageData(newBuffer);`

For more examples, see `examples/05-images/image-usage.ts`.
