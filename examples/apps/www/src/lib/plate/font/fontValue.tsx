/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const fontValue: any = (
  <fragment>
    <hp>
      <htext color="white" backgroundColor="black" fontSize="30px">
        This text has white color, black background and a custom font size.
      </htext>
    </hp>
    <hp>
      <htext color="grey" backgroundColor="green">
        This text has a custom color used for text and background.
      </htext>
    </hp>
    <hp>
      This text has <htext backgroundColor="#dc3735" />
      <htext color="white" backgroundColor="#df4538">
        m
      </htext>
      <htext color="white" backgroundColor="#e2533a">
        u
      </htext>
      <htext color="white" backgroundColor="#e6603d">
        l
      </htext>
      <htext color="white" backgroundColor="#e96f40">
        t
      </htext>
      <htext color="white" backgroundColor="#ec7d43">
        i
      </htext>
      <htext color="white" backgroundColor="#ef8a45">
        p
      </htext>
      <htext color="white" backgroundColor="#f29948">
        l
      </htext>
      <htext color="white" backgroundColor="#f5a74b">
        e
      </htext>
      <htext backgroundColor="#f9b44e" />
      <htext color="#ff0000">f</htext>
      <htext color="#ff3333">o</htext>
      <htext color="#ff6666">n</htext>
      <htext color="#ff9999">t</htext>
      <htext />
      <htext color="#ffcccc">c</htext>
      <htext color="#ffcccc">o</htext>
      <htext color="#ccffcc">l</htext>
      <htext color="#99ff99">o</htext>
      <htext color="#66ff66">r</htext>
      <htext color="#33ff33">s</htext>
      and <htext backgroundColor="#a58ce1">font</htext>{' '}
      <htext backgroundColor="#99cc62">background</htext>{' '}
      <htext backgroundColor="#e45260">colors</htext>.
    </hp>
    <hp>
      <htext bold italic underline color="#f92672">
        This text is bold, italic, underlined and colored.
      </htext>
    </hp>
  </fragment>
);
