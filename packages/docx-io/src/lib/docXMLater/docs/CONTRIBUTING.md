# Contributing to DocXMLater

Thank you for your interest in contributing to DocXML! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 14 or higher
- TypeScript 5.0 or higher
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/ItMeDiatech/docXMLater.git
   cd docXML
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Run tests:

   ```bash
   npm test
   ```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:

- `feature/add-custom-numbering`
- `fix/table-border-rendering`
- `docs/update-api-reference`

### Making Changes

1. Write your code following the project's coding standards
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Build the project: `npm run build`

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write unit tests for all new features
- Ensure all existing tests pass
- Aim for high code coverage
- Test edge cases and error conditions

Run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Commit Guidelines

### Commit Messages

Follow this format:

```text
<type>: <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```text
feat: add support for custom table styles

Implements custom table styling with borders, shading, and cell formatting.

Closes #123
```

```text
fix: correct paragraph spacing calculation

Fixed incorrect twips to points conversion that caused spacing issues.
```

### Commit Best Practices

- Make atomic commits (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and small

## Pull Request Process

### Before Submitting

1. Ensure all tests pass
2. Update documentation if needed
3. Add examples for new features
4. Rebase on latest master if needed

### Submitting a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a pull request from your fork to the main repository

3. Fill out the pull request template with:
   - Clear description of changes
   - Motivation and context
   - Screenshots (if applicable)
   - Related issue numbers

### Pull Request Guidelines

- Keep pull requests focused (one feature/fix per PR)
- Write a clear title and description
- Link to related issues
- Be responsive to feedback
- Update your PR based on review comments

## Testing New Features

When adding new features:

1. Add unit tests in `tests/` directory
2. Add examples in `examples/` directory
3. Update relevant documentation
4. Ensure backward compatibility (or document breaking changes)

## Documentation

### Code Documentation

- Add JSDoc comments to all public APIs
- Document parameters, return values, and exceptions
- Include usage examples in comments

Example:

````typescript
/**
 * Creates a new paragraph with specified text and formatting
 * @param text - The paragraph text content
 * @param formatting - Optional paragraph formatting options
 * @returns The created Paragraph instance
 * @example
 * ```typescript
 * const para = doc.createParagraph('Hello World', {
 *   alignment: 'center',
 *   bold: true
 * });
 * ```
 */
createParagraph(text?: string, formatting?: ParagraphFormatting): Paragraph
````

### User Documentation

- Update README.md for major features
- Add guides to `docs/guides/` for complex features
- Update API reference in `docs/api/`
- Include code examples

## Project Structure

```text
src/
├── core/          # Document, ZipHandler classes
├── elements/      # Paragraph, Run, Table elements
├── formatting/    # Style, NumberingManager
├── xml/           # XML generation utilities
├── zip/           # ZIP archive handling
└── utils/         # Validation and helper utilities

tests/
├── core/          # Core functionality tests
├── elements/      # Element tests
├── formatting/    # Formatting tests
└── utils/         # Utility tests

examples/
├── 01-basic/      # Basic usage examples
├── 02-text/       # Text formatting examples
└── ...            # Additional example categories

docs/
├── api/           # API reference documentation
├── guides/        # User guides and tutorials
└── architecture/  # Architecture documentation
```

## Reporting Issues

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Verify the issue with the latest version
- Collect relevant information (error messages, code samples)

### Creating a Good Issue

Include:

- Clear, descriptive title
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Version information
- Code samples (if applicable)
- Error messages and stack traces

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow the code of conduct

## Questions?

If you have questions:

- Check existing documentation
- Search closed issues
- Open a new issue with the `question` label

## License

By contributing to DocXML, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DocXML!
