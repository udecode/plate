/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

import { createIndentListPlugin } from '@/packages/nodes/indent-list/src/createIndentListPlugin';

jsx;

const name = 'tables';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hh2>
          <htext>A table, with and without a header row</htext>
        </hh2>
        <hp>
          <htext />
        </hp>
        <htable>
          <htr>
            <htd>
              <hp>
                <htext bold>Name</htext>
              </hp>
            </htd>
            <htd>
              <hp>
                <htext bold>Game</htext>
              </hp>
            </htd>
            <htd>
              <hp>
                <htext bold>Fame</htext>
              </hp>
            </htd>
            <htd>
              <hp>
                <htext bold>Blame</htext>
              </hp>
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

        <hp>
          <htext />
        </hp>

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

        <hp>
          <htext />
        </hp>

        <htable>
          <htr>
            <htd>
              <hp>Simple</hp>
              <hp>
                <htext />
              </hp>
              <hp>Multiparagraph</hp>
            </htd>
            <htd>
              <hp>Table</hp>
              <hp>
                <htext />
              </hp>
              <hp>Full</hp>
            </htd>
          </htr>

          <htr>
            <htd>
              <hp>Of</hp>
              <hp>
                <htext />
              </hp>
              <hp>Paragraphs</hp>
            </htd>
            <htd>
              <hp>In each</hp>
              <hp>
                <htext />
              </hp>
              <hp>Cell.</hp>
            </htd>
          </htr>
        </htable>

        <hp>
          <htext />
        </hp>
      </editor>
    ),
    plugins: [createIndentListPlugin()],
  });
});
