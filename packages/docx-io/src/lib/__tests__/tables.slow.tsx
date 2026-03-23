/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { getDocxTestName, testDocxImporter } from './testDocxImporter';

jsx;

const name = 'tables';

// mammoth output: tables preserved, background colors and header bold lost
describe(getDocxTestName(name), () => {
  testDocxImporter({
    expected: (
      <editor>
        <hh2>A table, with and without a header row</hh2>
        <htable>
          <htr>
            <htd>
              <hp>Name</hp>
            </htd>
            <htd>
              <hp>Game</hp>
            </htd>
            <htd>
              <hp>Fame</hp>
            </htd>
            <htd>
              <hp>Blame</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>Lebron James</hp>
            </htd>
            <htd>
              <hp>Basketball</hp>
            </htd>
            <htd>
              <hp>Very High</hp>
            </htd>
            <htd>
              <hp>Leaving Cleveland</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>Ryan Braun</hp>
            </htd>
            <htd>
              <hp>Baseball</hp>
            </htd>
            <htd>
              <hp>Moderate</hp>
            </htd>
            <htd>
              <hp>Steroids</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>Russell Wilson</hp>
            </htd>
            <htd>
              <hp>Football</hp>
            </htd>
            <htd>
              <hp>High</hp>
            </htd>
            <htd>
              <hp>Tacky uniform</hp>
            </htd>
          </htr>
        </htable>
        <htable>
          <htr>
            <htd>
              <hp>Sinple</hp>
            </htd>
            <htd>
              <hp>Table</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>Without</hp>
            </htd>
            <htd>
              <hp>Header</hp>
            </htd>
          </htr>
        </htable>
        <htable>
          <htr>
            <htd>
              <hp>Simple</hp>
              <hp>Multiparagraph</hp>
            </htd>
            <htd>
              <hp>Table</hp>
              <hp>Full</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>Of</hp>
              <hp>Paragraphs</hp>
            </htd>
            <htd>
              <hp>In each</hp>
              <hp>Cell.</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ),
    filename: name,
  });
});
