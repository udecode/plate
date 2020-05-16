/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeserializeHtml } from 'deserializers/deserialize-html';
import { ImagePlugin, withImage } from 'elements/image';
import { ParagraphPlugin } from 'elements/paragraph';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { initialValueImages } from '../../../../../../../stories/config/initialValues';

const input = ((
  <editor>
    <hp>
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const html =
  '<div data-slate-type="p" data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.</span></span></span></div><div data-slate-node="element" data-slate-void="true"><div contenteditable="false"><img data-slate-type="img" src="https://source.unsplash.com/kFrdX5IeQzI" alt="" class="sc-fznLxA fNbUHS"></div><div data-slate-spacer="true" style="height: 0px; color: transparent; outline: none; position: absolute;"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></div></div><div data-slate-type="p" data-slate-node="element" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnAlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJJbiUyMGFkZGl0aW9uJTIwdG8lMjBub2RlcyUyMHRoYXQlMjBjb250YWluJTIwZWRpdGFibGUlMjB0ZXh0JTJDJTIweW91JTIwY2FuJTIwYWxzbyUyMGNyZWF0ZSUyMG90aGVyJTIwdHlwZXMlMjBvZiUyMG5vZGVzJTJDJTIwbGlrZSUyMGltYWdlcyUyMG9yJTIwdmlkZW9zLiUyMiU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJpbWclMjIlMkMlMjJ1cmwlMjIlM0ElMjJodHRwcyUzQSUyRiUyRnNvdXJjZS51bnNwbGFzaC5jb20lMkZrRnJkWDVJZVF6SSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJwJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyVGhpcyUyMGV4YW1wbGUlMjBzaG93cyUyMGltYWdlcyUyMGluJTIwYWN0aW9uLiUyMEl0JTIwZmVhdHVyZXMlMjB0d28lMjB3YXlzJTIwdG8lMjBhZGQlMjBpbWFnZXMuJTIwWW91JTIwY2FuJTIwZWl0aGVyJTIwYWRkJTIwYW4lMjBpbWFnZSUyMHZpYSUyMHRoZSUyMHRvb2xiYXIlMjBpY29uJTIwYWJvdmUlMkMlMjBvciUyMGlmJTIweW91JTIwd2FudCUyMGluJTIwb24lMjBhJTIwbGl0dGxlJTIwc2VjcmV0JTJDJTIwY29weSUyMGFuJTIwaW1hZ2UlMjBVUkwlMjB0byUyMHlvdXIlMjBrZXlib2FyZCUyMGFuZCUyMHBhc3RlJTIwaXQlMjBhbnl3aGVyZSUyMGluJTIwdGhlJTIwZWRpdG9yISUyMiU3RCU1RCU3RCU1RA=="><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your keyboard and paste it anywhere in the editor!</span></span></span></div>';

const data = {
  getData: () => html,
};

it('should be', () => {
  const editor = withDeserializeHtml([ParagraphPlugin(), ImagePlugin()])(
    withImage()(withReact(input))
  );

  editor.insertData(data as any);

  expect(input.children).toEqual(initialValueImages);
});
