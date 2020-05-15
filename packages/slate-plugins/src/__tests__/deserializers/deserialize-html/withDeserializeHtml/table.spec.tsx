/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeserializeHtml } from 'deserializers/deserialize-html';
import { ParagraphPlugin } from 'elements/paragraph';
import { TablePlugin, withTable } from 'elements/table';
import { BoldPlugin } from 'marks/bold';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { initialValueTables } from '../../../../../../../stories/config/initialValues';

const input = ((
  <editor>
    <p>
      <cursor />
    </p>
  </editor>
) as any) as Editor;

const html =
  '<meta charset=\'utf-8\'><div data-slate-type="p" data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:</span></span></span></div><table data-slate-type="table" data-slate-node="element" class="sc-fzpjYC dQhQmr"><tbody><tr data-slate-type="tr" data-slate-node="element"><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0">\n' +
  '</span></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><strong><span data-slate-string="true">Human</span></strong></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><strong><span data-slate-string="true">Dog</span></strong></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><strong><span data-slate-string="true">Cat</span></strong></span></span></td></tr><tr data-slate-type="tr" data-slate-node="element"><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><strong><span data-slate-string="true"># of Feet</span></strong></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">2</span></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">4</span></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">4</span></span></span></td></tr><tr data-slate-type="tr" data-slate-node="element"><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><strong><span data-slate-string="true"># of Lives</span></strong></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">1</span></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">1</span></span></span></td><td data-slate-type="td" data-slate-node="element" class="sc-fzoXzr hLhibb"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">9</span></span></span></td></tr></tbody></table><div data-slate-type="p" data-slate-node="element" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnAlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJTaW5jZSUyMHRoZSUyMGVkaXRvciUyMGlzJTIwYmFzZWQlMjBvbiUyMGElMjByZWN1cnNpdmUlMjB0cmVlJTIwbW9kZWwlMkMlMjBzaW1pbGFyJTIwdG8lMjBhbiUyMEhUTUwlMjBkb2N1bWVudCUyQyUyMHlvdSUyMGNhbiUyMGNyZWF0ZSUyMGNvbXBsZXglMjBuZXN0ZWQlMjBzdHJ1Y3R1cmVzJTJDJTIwbGlrZSUyMHRhYmxlcyUzQSUyMiU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRyJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGQlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGQlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIdW1hbiUyMiUyQyUyMmJvbGQlMjIlM0F0cnVlJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRkJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyRG9nJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGQlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJDYXQlMjIlMkMlMjJib2xkJTIyJTNBdHJ1ZSU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0ciUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRkJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIzJTIwb2YlMjBGZWV0JTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGQlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIyJTIyJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRkJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyNCUyMiU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0ZCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMjQlMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydHIlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJ0ZCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMyUyMG9mJTIwTGl2ZXMlMjIlMkMlMjJib2xkJTIyJTNBdHJ1ZSU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0ZCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMjElMjIlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGQlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIxJTIyJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRkJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyOSUyMiU3RCU1RCU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJwJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyVGhpcyUyMHRhYmxlJTIwaXMlMjBqdXN0JTIwYSUyMGJhc2ljJTIwZXhhbXBsZSUyMG9mJTIwcmVuZGVyaW5nJTIwYSUyMHRhYmxlJTJDJTIwYW5kJTIwaXQlMjBkb2Vzbid0JTIwaGF2ZSUyMGZhbmN5JTIwZnVuY3Rpb25hbGl0eS4lMjBCdXQlMjB5b3UlMjBjb3VsZCUyMGF1Z21lbnQlMjBpdCUyMHRvJTIwYWRkJTIwc3VwcG9ydCUyMGZvciUyMG5hdmlnYXRpbmclMjB3aXRoJTIwYXJyb3clMjBrZXlzJTJDJTIwZGlzcGxheWluZyUyMHRhYmxlJTIwaGVhZGVycyUyQyUyMGFkZGluZyUyMGNvbHVtbiUyMGFuZCUyMHJvd3MlMkMlMjBvciUyMGV2ZW4lMjBmb3JtdWxhcyUyMGlmJTIweW91JTIwd2FudGVkJTIwdG8lMjBnZXQlMjByZWFsbHklMjBjcmF6eSElMjIlN0QlNUQlN0QlNUQ="><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">This table is just a basic example of rendering a table, and it doesn\'t have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!</span></span></span></div>';

const data = {
  getData: () => html,
};

it('should be', () => {
  const editor = withDeserializeHtml([
    ParagraphPlugin(),
    TablePlugin(),
    BoldPlugin(),
  ])(withTable()(withReact(input)));

  editor.insertData(data as any);

  expect(input.children).toEqual(initialValueTables);
});
