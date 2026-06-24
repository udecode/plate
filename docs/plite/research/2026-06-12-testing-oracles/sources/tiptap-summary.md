# Tiptap Source Summary

## File Read

- `../tiptap/tests/cypress/support/commands.js`

## Finding

Tiptap's Cypress paste helper builds a `DataTransfer`, puts the requested data
under a MIME type, creates a cancelable bubbling `ClipboardEvent('paste')`, and
dispatches it on the subject.

## Decision

Reject as duplicate. Plite's `plite-browser` already does that plus native
clipboard access, exclusive locking, copy/cut payload snapshots, HTML/text
fallbacks, command trace checks, and model/native selection assertions.

