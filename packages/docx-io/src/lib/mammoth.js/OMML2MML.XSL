<?xml version="1.0" encoding="utf-8"?>
<!-- Beta Version 070708 -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
		xmlns="http://www.w3.org/1998/Math/MathML"
		xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
		version="3.0"
                exclude-result-prefixes="m w">
	<!-- %% Global Definitions -->

	<!-- Every single unicode character that is recognized by OMML as an operator -->
	<xsl:variable name="sOperators"
                 select="concat(      '!&#34;#&amp;()+,-./:',           ';&lt;=&gt;?@[\]^_{',           '|}~¡¦¬¯°±²³·¹¿',           '×÷̀́̂̃̄̅̆̇̈̉',           '̊̋̌̍̎̏̐̑̒̓̔̕',           '̡̛̖̗̘̙̜̝̞̟̠̚',           '̢̧̨̣̤̥̦̩̪̫̬̭',           '̴̵̶̷̸̮̯̰̱̲̳̿',           '         ‐‒–',           '—‖†‡•․‥…′″‴‼',           '⁀⁄⁎⁏⁐⁗⁡⁢⁣⁰⁴⁵',           '⁶⁷⁸⁹⁺⁻⁼⁽⁾₀₁₂',           '₃₄₅₆₇₈₉₊₋₌₍₎',           '⃒⃓⃘⃙⃚⃐⃑⃔⃕⃖⃗⃛',           '⃜⃝⃞⃟⃠⃡⃤⃥⃦⃨⃧⃩',           '⃪⅀ࡢ←↑→↓↔↕↖↗↘↙',           '↚↛↜↝↞↟↠↡↢↣↤↥',           '↦↧↨↩↪↫↬↭↮↯↰↱',           '↲↳↶↷↺↻↼↽↾↿⇀⇁',           '⇂⇃⇄⇅⇆⇇⇈⇉⇊⇋⇌⇍',           '⇎⇏⇐⇑⇒⇓⇔⇕⇖⇗⇘⇙',           '⇚⇛⇜⇝⇞⇟⇠⇡⇢⇣⇤⇥',           '⇦⇧⇨⇩⇳⇴⇵⇶⇷⇸⇹⇺',           '⇻⇼⇽⇾⇿∀∁∂∃∄∆∇',           '∈∉∊∋∌∍∏∐∑−∓∔',           '∕∖∗∘∙√∛∜∝∣∤∥',           '∦∧∨∩∪∫∬∭∮∯∰∱',           '∲∳∴∵∶∷∸∹∺∻∼∽',           '∾≀≁≂≃≄≅≆≇≈≉≊',           '≋≌≍≎≏≐≑≒≓≔≕≖',           '≗≘≙≚≛≜≝≞≟≠≡≢',           '≣≤≥≦≧≨≩≪≫≬≭≮',           '≯≰≱≲≳≴≵≶≷≸≹≺',           '≻≼≽≾≿⊀⊁⊂⊃⊄⊅⊆',           '⊇⊈⊉⊊⊋⊌⊍⊎⊏⊐⊑⊒',           '⊓⊔⊕⊖⊗⊘⊙⊚⊛⊜⊝⊞',           '⊟⊠⊡⊢⊣⊥⊦⊧⊨⊩⊪⊫',           '⊬⊭⊮⊯⊰⊱⊲⊳⊴⊵⊶⊷',           '⊸⊹⊺⊻⊼⊽⋀⋁⋂⋃⋄⋅',           '⋆⋇⋈⋉⋊⋋⋌⋍⋎⋏⋐⋑',           '⋒⋓⋔⋕⋖⋗⋘⋙⋚⋛⋜⋝',           '⋞⋟⋠⋡⋢⋣⋤⋥⋦⋧⋨⋩',           '⋪⋫⋬⋭⋮⋯⋰⋱⋲⋳⋴⋵',           '⋶⋷⋸⋹⋺⋻⋼⋽⋾⋿⌅⌆',           '⌈⌉⌊⌋⌜⌝⌞⌟⌢⌣〈〉',           '⌽⌿⎰⎱⏜⏝⏞⏟⏠│├┤',           '┬┴▁█▒■□▭▲△▴▵',           '▶▷▸▹▼▽▾▿◀◁◂◃',           '◄◅◊○◦◫◬◸◹◺◻◼',           '◽◾◿★☆❲❳⟑⟒⟓⟔⟕',           '⟖⟗⟘⟙⟚⟛⟜⟝⟞⟟⟠⟡',           '⟢⟣⟤⟥⟦⟧⟨⟩⟪⟫⟰⟱',           '⟲⟳⟴⟵⟶⟷⟸⟹⟺⟻⟼⟽',           '⟾⟿⤀⤁⤂⤃⤄⤅⤆⤇⤈⤉',           '⤊⤋⤌⤍⤎⤏⤐⤑⤒⤓⤔⤕',           '⤖⤗⤘⤙⤚⤛⤜⤝⤞⤟⤠⤡',           '⤢⤣⤤⤥⤦⤧⤨⤩⤪⤫⤬⤭',           '⤮⤯⤰⤱⤲⤳⤴⤵⤶⤷⤸⤹',           '⤺⤻⤼⤽⤾⤿⥀⥁⥂⥃⥄⥅',           '⥆⥇⥈⥉⥊⥋⥌⥍⥎⥏⥐⥑',           '⥒⥓⥔⥕⥖⥗⥘⥙⥚⥛⥜⥝',           '⥞⥟⥠⥡⥢⥣⥤⥥⥦⥧⥨⥩',           '⥪⥫⥬⥭⥮⥯⥰⥱⥲⥳⥴⥵',           '⥶⥷⥸⥹⥺⥻⥼⥽⥾⥿⦀⦂',           '⦃⦄⦅⦆⦇⦈⦉⦊⦋⦌⦍⦎',           '⦏⦐⦑⦒⦓⦔⦕⦖⦗⦘⦙⦚',           '⦶⦷⦸⦹⧀⧁⧄⧅⧆⧇⧈⧎',           '⧏⧐⧑⧒⧓⧔⧕⧖⧗⧘⧙⧚',           '⧛⧟⧡⧢⧣⧤⧥⧦⧫⧴⧵⧶',           '⧷⧸⧹⧺⧻⧼⧽⧾⧿⨀⨁⨂',           '⨃⨄⨅⨆⨇⨈⨉⨊⨋⨌⨍⨎',           '⨏⨐⨑⨒⨓⨔⨕⨖⨗⨘⨙⨚',           '⨛⨜⨝⨞⨟⨠⨡⨢⨣⨤⨥⨦',           '⨧⨨⨩⨪⨫⨬⨭⨮⨯⨰⨱⨲',           '⨳⨴⨵⨶⨷⨸⨹⨺⨻⨼⨽⨾',           '⨿⩀⩁⩂⩃⩄⩅⩆⩇⩈⩉⩊',           '⩋⩌⩍⩎⩏⩐⩑⩒⩓⩔⩕⩖',           '⩗⩘⩙⩚⩛⩜⩝⩞⩟⩠⩡⩢',           '⩣⩤⩥⩦⩧⩨⩩⩪⩫⩬⩭⩮',           '⩯⩰⩱⩲⩳⩴⩵⩶⩷⩸⩹⩺',           '⩻⩼⩽⩾⩿⪀⪁⪂⪃⪄⪅⪆',           '⪇⪈⪉⪊⪋⪌⪍⪎⪏⪐⪑⪒',           '⪓⪔⪕⪖⪗⪘⪙⪚⪛⪜⪝⪞',           '⪟⪠⪡⪢⪣⪤⪥⪦⪧⪨⪩⪪',           '⪫⪬⪭⪮⪯⪰⪱⪲⪳⪴⪵⪶',           '⪷⪸⪹⪺⪻⪼⪽⪾⪿⫀⫁⫂',           '⫃⫄⫅⫆⫇⫈⫉⫊⫋⫌⫍⫎',           '⫏⫐⫑⫒⫓⫔⫕⫖⫗⫘⫙⫚',           '⫛⫝̸⫝⫞⫟⫠⫢⫣⫤⫥⫦⫧',           '⫨⫩⫪⫫⫬⫭⫮⫯⫰⫲⫳⫴',           '⫵⫶⫷⫸⫹⫺⫻⫼⫽⫾⫿⬄',           '⬆⬇⬌⬍〔〕〖〗〘〙！＆',           '（）＋，－．／：；＜＝＞',           '？＠［＼］＾＿｛｜｝')"/>

	  <!-- A string of '-'s repeated exactly as many times as the operators above -->
	<xsl:variable name="sMinuses">
		    <xsl:call-template name="SRepeatChar">
			      <xsl:with-param name="cchRequired" select="string-length($sOperators)"/>
			      <xsl:with-param name="ch" select="'-'"/>
		    </xsl:call-template>
	  </xsl:variable>

	  <!-- Every single unicode character that is recognized by OMML as a number -->
	<xsl:variable name="sNumbers" select="'0123456789'"/>

	  <!-- A string of '0's repeated exactly as many times as the list of numbers above -->
	<xsl:variable name="sZeros">
		    <xsl:call-template name="SRepeatChar">
			      <xsl:with-param name="cchRequired" select="string-length($sNumbers)"/>
			      <xsl:with-param name="ch" select="'0'"/>
		    </xsl:call-template>
	  </xsl:variable>

	  <!-- %%Template: SReplace

		Replace all occurences of sOrig in sInput with sReplacement
		and return the resulting string. -->
	<xsl:template name="SReplace">
		    <xsl:param name="sInput"/>
		    <xsl:param name="sOrig"/>
		    <xsl:param name="sReplacement"/>

		    <xsl:choose>
			      <xsl:when test="not(contains($sInput, $sOrig))">
				        <xsl:value-of select="$sInput"/>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:variable name="sBefore" select="substring-before($sInput, $sOrig)"/>
				        <xsl:variable name="sAfter" select="substring-after($sInput, $sOrig)"/>
				        <xsl:variable name="sAfterProcessed">
					          <xsl:call-template name="SReplace">
						            <xsl:with-param name="sInput" select="$sAfter"/>
						            <xsl:with-param name="sOrig" select="$sOrig"/>
						            <xsl:with-param name="sReplacement" select="$sReplacement"/>
					          </xsl:call-template>
				        </xsl:variable>

				        <xsl:value-of select="concat($sBefore, concat($sReplacement, $sAfterProcessed))"/>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <!-- Templates -->
	<!--
	    <xsl:template match="/">
	    <math>
	    <xsl:apply-templates select="*" />
	    </math>
	</xsl:template>
	-->
	<xsl:template match="m:borderBox">

		<!-- Get Lowercase versions of properties -->
		<xsl:variable name="sLowerCaseHideTop"
                    select="translate(m:borderBoxPr[last()]/m:hideTop[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseHideBot"
                    select="translate(m:borderBoxPr[last()]/m:hideBot[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseHideLeft"
                    select="translate(m:borderBoxPr[last()]/m:hideLeft[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseHideRight"
                    select="translate(m:borderBoxPr[last()]/m:hideRight[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseStrikeH"
                    select="translate(m:borderBoxPr[last()]/m:strikeH[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseStrikeV"
                    select="translate(m:borderBoxPr[last()]/m:strikeV[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseStrikeBLTR"
                    select="translate(m:borderBoxPr[last()]/m:strikeBLTR[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseStrikeTLBR"
                    select="translate(m:borderBoxPr[last()]/m:strikeTLBR[last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="fHideTop">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseHideTop='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fHideBot">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseHideBot='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fHideLeft">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseHideLeft='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fHideRight">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseHideRight='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fStrikeH">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseStrikeH='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fStrikeV">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseStrikeV='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fStrikeBLTR">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseStrikeBLTR='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fStrikeTLBR">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseStrikeTLBR='on'">
					          <xsl:text>1</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>0</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>

		    <menclose>
			      <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
				        <xsl:with-param name="fHideTop" select="$fHideTop"/>
				        <xsl:with-param name="fHideBot" select="$fHideBot"/>
				        <xsl:with-param name="fHideLeft" select="$fHideLeft"/>
				        <xsl:with-param name="fHideRight" select="$fHideRight"/>
				        <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
				        <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
				        <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
				        <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
			      </xsl:call-template>
			      <xsl:apply-templates select="m:e[1]"/>
		    </menclose>
	  </xsl:template>

	  <xsl:template match="*">
		    <xsl:apply-templates select="*"/>
	  </xsl:template>

	  <xsl:template match="m:acc">
		    <mover>
			      <xsl:attribute name="accent">true</xsl:attribute>
			      <mrow>
				        <xsl:apply-templates select="m:e[1]"/>
			      </mrow>
			      <xsl:variable name="chAcc">
				        <xsl:choose>
					          <xsl:when test="not(m:accPr[last()]/m:chr)">
						            <xsl:value-of select="'̂'"/>
					          </xsl:when>
					          <xsl:otherwise>
						            <xsl:value-of select="substring(m:accPr/m:chr/@m:val,1,1)"/>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:variable>
			      <xsl:call-template name="ParseMt">
				        <xsl:with-param name="sToParse" select="$chAcc"/>
				        <xsl:with-param name="scr" select="m:e[1]/*/m:rPr[last()]/m:scr/@m:val"/>
				        <xsl:with-param name="sty" select="m:e[1]/*/m:rPr[last()]/m:sty/@m:val"/>
				        <xsl:with-param name="nor" select="m:e[1]/*/m:rPr[last()]/m:nor/@m:val"/>
			      </xsl:call-template>
		    </mover>
	  </xsl:template>

	  <xsl:template match="m:sPre">
		    <mmultiscripts>
			      <mrow>
				        <xsl:apply-templates select="m:e[1]"/>
			      </mrow>
			      <mprescripts/>
			      <mrow>
				        <xsl:apply-templates select="m:sub[1]"/>
			      </mrow>
			      <mrow>
				        <xsl:apply-templates select="m:sup[1]"/>
			      </mrow>
		    </mmultiscripts>
	  </xsl:template>

	  <xsl:template match="m:m">
		    <mtable>
			      <xsl:call-template name="CreateMathMLMatrixAttr">
				        <xsl:with-param name="mcJc" select="m:mPr[last()]/m:mcs/m:mc/m:mcPr[last()]/m:mcJc/@m:val"/>
			      </xsl:call-template>
			      <xsl:for-each select="m:mr">
				        <mtr>
					          <xsl:for-each select="m:e">
						            <mtd>
							              <xsl:apply-templates select="."/>
						            </mtd>
					          </xsl:for-each>
				        </mtr>
			      </xsl:for-each>
		    </mtable>
	  </xsl:template>

	  <xsl:template name="CreateMathMLMatrixAttr">
		    <xsl:param name="mcJc"/>
		    <xsl:variable name="sLowerCaseMcjc"
                    select="translate($mcJc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:choose>
			      <xsl:when test="$sLowerCaseMcjc='left'">
				        <xsl:attribute name="columnalign">left</xsl:attribute>
			      </xsl:when>
			      <xsl:when test="$sLowerCaseMcjc='right'">
				        <xsl:attribute name="columnalign">right</xsl:attribute>
			      </xsl:when>
		    </xsl:choose>
	  </xsl:template>

	  <xsl:template match="m:phant">
		    <xsl:variable name="sLowerCaseZeroWidVal"
                    select="translate(m:phantPr[last()]/m:zeroWid[last()]/@m:val,                                                           'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                           'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseZeroAscVal"
                    select="translate(m:phantPr[last()]/m:zeroAsc[last()]/@m:val,                                                         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                         'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseZeroDescVal"
                    select="translate(m:phantPr[last()]/m:zeroDesc[last()]/@m:val,                                                         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                         'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseShowVal"
                    select="translate(m:phantPr[last()]/m:show[last()]/@m:val,                                                         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                         'abcdefghijklmnopqrstuvwxyz')"/>


		    <!-- The following properties default to 'yes' unless the last value equals 'no' or there isn't any node for 
         the property -->

		<xsl:variable name="fZeroWid">
			      <xsl:choose>
				        <xsl:when test="count(m:phantPr[last()]/m:zeroWid[last()]) = 0">0</xsl:when>
				        <xsl:when test="$sLowerCaseZeroWidVal = 'off'">0</xsl:when>
				        <xsl:otherwise>1</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fZeroAsc">
			      <xsl:choose>
				        <xsl:when test="count(m:phantPr[last()]/m:zeroAsc[last()]) = 0">0</xsl:when>
				        <xsl:when test="$sLowerCaseZeroAscVal = 'off'">0</xsl:when>
				        <xsl:otherwise>1</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fZeroDesc">
			      <xsl:choose>
				        <xsl:when test="count(m:phantPr[last()]/m:zeroDesc[last()]) = 0">0</xsl:when>
				        <xsl:when test="$sLowerCaseZeroDescVal = 'off'">0</xsl:when>
				        <xsl:otherwise>1</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>

		    <!-- The show property defaults to 'on' unless there exists a show property and its value is 'off' -->

		<xsl:variable name="fShow">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseShowVal = 'off'">0</xsl:when>
				        <xsl:otherwise>1</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>

		    <xsl:choose>
			<!-- Show the phantom contents, therefore, just use mpadded. -->
			<xsl:when test="$fShow = 1">
				        <xsl:element name="mpadded">
					          <xsl:call-template name="CreateMpaddedAttributes">
						            <xsl:with-param name="fZeroWid" select="$fZeroWid"/>
						            <xsl:with-param name="fZeroAsc" select="$fZeroAsc"/>
						            <xsl:with-param name="fZeroDesc" select="$fZeroDesc"/>
					          </xsl:call-template>
					          <mrow>
						            <xsl:apply-templates select="m:e"/>
					          </mrow>
				        </xsl:element>
			      </xsl:when>
			      <!-- Don't show phantom contents, but don't smash anything, therefore, just 
           use mphantom -->
			<xsl:when test="$fZeroWid=0 and $fZeroAsc=0 and $fZeroDesc=0">
				        <xsl:element name="mphantom">
					          <mrow>
						            <xsl:apply-templates select="m:e"/>
					          </mrow>
				        </xsl:element>
			      </xsl:when>
			      <!-- Combination -->
			<xsl:otherwise>
				        <xsl:element name="mphantom">
					          <xsl:element name="mpadded">
						            <xsl:call-template name="CreateMpaddedAttributes">
							              <xsl:with-param name="fZeroWid" select="$fZeroWid"/>
							              <xsl:with-param name="fZeroAsc" select="$fZeroAsc"/>
							              <xsl:with-param name="fZeroDesc" select="$fZeroDesc"/>
						            </xsl:call-template>
						            <mrow>
							              <xsl:apply-templates select="m:e"/>
						            </mrow>
					          </xsl:element>
				        </xsl:element>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <xsl:template name="CreateMpaddedAttributes">
		    <xsl:param name="fZeroWid"/>
		    <xsl:param name="fZeroAsc"/>
		    <xsl:param name="fZeroDesc"/>

		    <xsl:if test="$fZeroWid=1">
			      <xsl:attribute name="width">0</xsl:attribute>
		    </xsl:if>
		    <xsl:if test="$fZeroAsc=1">
			      <xsl:attribute name="height">0</xsl:attribute>
		    </xsl:if>
		    <xsl:if test="$fZeroDesc=1">
			      <xsl:attribute name="depth">0</xsl:attribute>
		    </xsl:if>
	  </xsl:template>



	  <xsl:template match="m:rad">
		    <xsl:variable name="sLowerCaseDegHide"
                    select="translate(m:radPr[last()]/m:degHide/@m:val,                                                              'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                              'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:choose>
			      <xsl:when test="$sLowerCaseDegHide='on'">
				        <msqrt>
					          <xsl:apply-templates select="m:e[1]"/>
				        </msqrt>
			      </xsl:when>
			      <xsl:otherwise>
				        <mroot>
					          <mrow>
						            <xsl:apply-templates select="m:e[1]"/>
					          </mrow>
					          <mrow>
						            <xsl:apply-templates select="m:deg[1]"/>
					          </mrow>
				        </mroot>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <!-- %%Template match m:nary 
		Process an n-ary. 
		
		Decides, based on which arguments are supplied, between
		using an mo, msup, msub, or msubsup for the n-ary operator		
	-->
	<xsl:template match="m:nary">
		    <xsl:variable name="sLowerCaseSubHide">
			      <xsl:choose>
				        <xsl:when test="count(m:naryPr[last()]/m:subHide) = 0">
					          <xsl:text>off</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:value-of select="translate(m:naryPr[last()]/m:subHide/@m:val,                                     'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                     'abcdefghijklmnopqrstuvwxyz')"/>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="sLowerCaseSupHide">
			      <xsl:choose>
				        <xsl:when test="count(m:naryPr[last()]/m:supHide) = 0">
					          <xsl:text>off</xsl:text>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:value-of select="translate(m:naryPr[last()]/m:supHide/@m:val,                                     'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                     'abcdefghijklmnopqrstuvwxyz')"/>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="sLowerCaseLimLoc">
			      <xsl:value-of select="translate(m:naryPr[last()]/m:limLoc/@m:val,                                     'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                     'abcdefghijklmnopqrstuvwxyz')"/>
		    </xsl:variable>
		    <xsl:variable name="fLimLocSubSup">
			      <xsl:choose>
				        <xsl:when test="count(m:naryPr[last()]/m:limLoc)=0 or $sLowerCaseLimLoc='subsup'">1</xsl:when>
				        <xsl:otherwise>0</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:choose>
			      <xsl:when test="not($sLowerCaseSupHide='off') and                     not($sLowerCaseSubHide='off')">
				        <mo>
					          <xsl:choose>
						            <xsl:when test="not(m:naryPr[last()]/m:chr/@m:val) or                                m:naryPr[last()]/m:chr/@m:val=''">
							              <xsl:text>&#x222b;</xsl:text>
						            </xsl:when>
						            <xsl:otherwise>
							              <xsl:value-of select="m:naryPr[last()]/m:chr/@m:val"/>
						            </xsl:otherwise>
					          </xsl:choose>
				        </mo>
			      </xsl:when>
			      <xsl:when test="not($sLowerCaseSubHide='off')">
				        <xsl:choose>
					          <xsl:when test="$fLimLocSubSup=1">
						            <msup>
							              <mo>
								                <xsl:choose>
									                  <xsl:when test="not(m:naryPr[last()]/m:chr/@m:val) or                                            m:naryPr[last()]/m:chr/@m:val=''">
										                    <xsl:text>&#x222b;</xsl:text>
									                  </xsl:when>
									                  <xsl:otherwise>
										                    <xsl:value-of select="m:naryPr[last()]/m:chr/@m:val"/>
									                  </xsl:otherwise>
								                </xsl:choose>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:sup[1]"/>
							              </mrow>
						            </msup>
					          </xsl:when>
					          <xsl:otherwise>
						            <mover>
							              <mo>
								                <xsl:choose>
									                  <xsl:when test="not(m:naryPr[last()]/m:chr/@m:val) or                                            m:naryPr[last()]/m:chr/@m:val=''">
										                    <xsl:text>&#x222b;</xsl:text>
									                  </xsl:when>
									                  <xsl:otherwise>
										                    <xsl:value-of select="m:naryPr[last()]/m:chr/@m:val"/>
									                  </xsl:otherwise>
								                </xsl:choose>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:sup[1]"/>
							              </mrow>
						            </mover>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:when>
			      <xsl:when test="not($sLowerCaseSupHide='off')">
				        <xsl:choose>
					          <xsl:when test="$fLimLocSubSup=1">
						            <msub>
							              <mo>
								                <xsl:choose>
									                  <xsl:when test="not(m:naryPr[last()]/m:chr/@m:val) or                                            m:naryPr[last()]/m:chr/@m:val=''">
										                    <xsl:text>&#x222b;</xsl:text>
									                  </xsl:when>
									                  <xsl:otherwise>
										                    <xsl:value-of select="m:naryPr[last()]/m:chr/@m:val"/>
									                  </xsl:otherwise>
								                </xsl:choose>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:sub[1]"/>
							              </mrow>
						            </msub>
					          </xsl:when>
					          <xsl:otherwise>
						            <munder>
							              <mo>
								                <xsl:choose>
									                  <xsl:when test="not(m:naryPr[last()]/m:chr/@m:val) or                            m:naryPr[last()]/m:chr/@m:val=''">
										                    <xsl:text>&#x222b;</xsl:text>
									                  </xsl:when>
									                  <xsl:otherwise>
										                    <xsl:value-of select="m:naryPr[last()]/m:chr/@m:val"/>
									                  </xsl:otherwise>
								                </xsl:choose>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:sub[1]"/>
							              </mrow>
						            </munder>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:choose>
					          <xsl:when test="$fLimLocSubSup=1">
						            <msubsup>
							              <mo>
								                <xsl:choose>
									                  <xsl:when test="not(m:naryPr[last()]/m:chr/@m:val) or                                            m:naryPr[last()]/m:chr/@m:val=''">
										                    <xsl:text>&#x222b;</xsl:text>
									                  </xsl:when>
									                  <xsl:otherwise>
										                    <xsl:value-of select="m:naryPr[last()]/m:chr/@m:val"/>
									                  </xsl:otherwise>
								                </xsl:choose>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:sub[1]"/>
							              </mrow>
							              <mrow>
								                <xsl:apply-templates select="m:sup[1]"/>
							              </mrow>
						            </msubsup>
					          </xsl:when>
					          <xsl:otherwise>
						            <munderover>
							              <mo>
								                <xsl:choose>
									                  <xsl:when test="not(m:naryPr[last()]/m:chr/@m:val) or                                            m:naryPr[last()]/m:chr/@m:val=''">
										                    <xsl:text>&#x222b;</xsl:text>
									                  </xsl:when>
									                  <xsl:otherwise>
										                    <xsl:value-of select="m:naryPr[last()]/m:chr/@m:val"/>
									                  </xsl:otherwise>
								                </xsl:choose>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:sub[1]"/>
							              </mrow>
							              <mrow>
								                <xsl:apply-templates select="m:sup[1]"/>
							              </mrow>
						            </munderover>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:otherwise>
		    </xsl:choose>
		    <mrow>
			      <xsl:apply-templates select="m:e[1]"/>
		    </mrow>
	  </xsl:template>

	  <xsl:template match="m:limLow">
		    <munder>
			      <mrow>
				        <xsl:apply-templates select="m:e[1]"/>
			      </mrow>
			      <mrow>
				        <xsl:apply-templates select="m:lim[1]"/>
			      </mrow>
		    </munder>
	  </xsl:template>

	  <xsl:template match="m:limUpp">
		    <mover>
			      <mrow>
				        <xsl:apply-templates select="m:e[1]"/>
			      </mrow>
			      <mrow>
				        <xsl:apply-templates select="m:lim[1]"/>
			      </mrow>
		    </mover>
	  </xsl:template>

	  <xsl:template match="m:sSub">
		    <msub>
			      <mrow>
				        <xsl:apply-templates select="m:e[1]"/>
			      </mrow>
			      <mrow>
				        <xsl:apply-templates select="m:sub[1]"/>
			      </mrow>
		    </msub>
	  </xsl:template>

	  <xsl:template match="m:sSup">
		    <msup>
			      <mrow>
				        <xsl:apply-templates select="m:e[1]"/>
			      </mrow>
			      <mrow>
				        <xsl:apply-templates select="m:sup[1]"/>
			      </mrow>
		    </msup>
	  </xsl:template>

	  <xsl:template match="m:sSubSup">
		    <msubsup>
			      <mrow>
				        <xsl:apply-templates select="m:e[1]"/>
			      </mrow>
			      <mrow>
				        <xsl:apply-templates select="m:sub[1]"/>
			      </mrow>
			      <mrow>
				        <xsl:apply-templates select="m:sup[1]"/>
			      </mrow>
		    </msubsup>
	  </xsl:template>

	  <xsl:template match="m:groupChr">
		    <xsl:variable name="ndLastGroupChrPr" select="m:groupChrPr[last()]"/>
		    <xsl:variable name="sLowerCasePos"
                    select="translate($ndLastGroupChrPr/m:pos/@m:val,                                                         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                         'abcdefghijklmnopqrstuvwxyz')"/>

		    <xsl:variable name="sLowerCaseVertJc"
                    select="translate($ndLastGroupChrPr/m:vertJc/@m:val,                                                         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                         'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="ndLastChr" select="$ndLastGroupChrPr/m:chr"/>

		    <xsl:variable name="chr">
			      <xsl:choose>
				        <xsl:when test="$ndLastChr and (not($ndLastChr/@m:val) or string-length($ndLastChr/@m:val) = 0)"/>
				        <xsl:when test="string-length($ndLastChr/@m:val) &gt;= 1">
					          <xsl:value-of select="substring($ndLastChr/@m:val,1,1)"/>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:text>&amp;#x023DF;</xsl:text>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:choose>
			      <xsl:when test="$sLowerCasePos = 'top'">
				        <xsl:choose>
					          <xsl:when test="$sLowerCaseVertJc = 'bot'">
						            <mover accent="false">
							              <mrow>
								                <xsl:apply-templates select="m:e[1]"/>
							              </mrow>
							              <mo>
								                <xsl:value-of disable-output-escaping="yes" select="$chr"/>
							              </mo>
						            </mover>
					          </xsl:when>
					          <xsl:otherwise>
						            <munder accentunder="false">
							              <mo>
								                <xsl:value-of disable-output-escaping="yes" select="$chr"/>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:e[1]"/>
							              </mrow>
						            </munder>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:choose>
					          <xsl:when test="$sLowerCaseVertJc = 'bot'">
						            <mover accent="false">
							              <mo>
								                <xsl:value-of disable-output-escaping="yes" select="$chr"/>
							              </mo>
							              <mrow>
								                <xsl:apply-templates select="m:e[1]"/>
							              </mrow>
						            </mover>
					          </xsl:when>
					          <xsl:otherwise>
						            <munder accentunder="false">
							              <mrow>
								                <xsl:apply-templates select="m:e[1]"/>
							              </mrow>
							              <mo>
								                <xsl:value-of disable-output-escaping="yes" select="$chr"/>
							              </mo>
						            </munder>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <xsl:template name="fName">
		    <xsl:for-each select="m:fName/*">
			      <xsl:apply-templates select="."/>
		    </xsl:for-each>
	  </xsl:template>

	  <xsl:template match="m:func">
		    <mrow>
			      <mrow>
				        <xsl:call-template name="fName"/>
			      </mrow>
			      <mo>⁡</mo>
			      <mrow>
				        <xsl:apply-templates select="m:e"/>
			      </mrow>
		    </mrow>
	  </xsl:template>

	  <!-- %%Template: match m:f 
		
		m:f maps directly to mfrac. 
	-->
	<xsl:template match="m:f">
		    <xsl:variable name="sLowerCaseType"
                    select="translate(m:fPr[last()]/m:type/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:choose>
			      <xsl:when test="$sLowerCaseType='lin'">
				        <mrow>
					          <mrow>
						            <xsl:apply-templates select="m:num[1]"/>
					          </mrow>
					          <mo>/</mo>
					          <mrow>
						            <xsl:apply-templates select="m:den[1]"/>
					          </mrow>
				        </mrow>
			      </xsl:when>
			      <xsl:otherwise>
				        <mfrac>
					          <xsl:call-template name="CreateMathMLFracProp">
						            <xsl:with-param name="type" select="$sLowerCaseType"/>
					          </xsl:call-template>
					          <mrow>
						            <xsl:apply-templates select="m:num[1]"/>
					          </mrow>
					          <mrow>
						            <xsl:apply-templates select="m:den[1]"/>
					          </mrow>
				        </mfrac>
			      </xsl:otherwise>
		    </xsl:choose>

	  </xsl:template>


	  <!-- %%Template: CreateMathMLFracProp 
		
			Make fraction properties based on supplied parameters.
			OMML differentiates between a linear fraction and a skewed
			one. For MathML, we write both as bevelled.
	-->
	<xsl:template name="CreateMathMLFracProp">
		    <xsl:param name="type"/>
		    <xsl:variable name="sLowerCaseType"
                    select="translate($type, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>

		    <xsl:if test="$sLowerCaseType='skw' or $sLowerCaseType='lin'">
			      <xsl:attribute name="bevelled">true</xsl:attribute>
		    </xsl:if>
		    <xsl:if test="$sLowerCaseType='nobar'">
			      <xsl:attribute name="linethickness">0pt</xsl:attribute>
		    </xsl:if>
		    <xsl:choose>
			      <xsl:when test="sLowerCaseNumJc='right'">
				        <xsl:attribute name="numalign">right</xsl:attribute>
			      </xsl:when>
			      <xsl:when test="sLowerCaseNumJc='left'">
				        <xsl:attribute name="numalign">left</xsl:attribute>
			      </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			      <xsl:when test="sLowerCaseDenJc='right'">
				        <xsl:attribute name="numalign">right</xsl:attribute>
			      </xsl:when>
			      <xsl:when test="sLowerCaseDenJc='left'">
				        <xsl:attribute name="numalign">left</xsl:attribute>
			      </xsl:when>
		    </xsl:choose>
	  </xsl:template>

	  <!-- %%Template: match m:e | m:den | m:num | m:lim | m:sup | m:sub 
		
		These element delinate parts of an expression (like the numerator).  -->
	<xsl:template match="m:e | m:den | m:num | m:lim | m:sup | m:sub">
		    <xsl:choose>

			<!-- If there is no scriptLevel specified, just call through -->
			<xsl:when test="not(m:argPr[last()]/m:scrLvl/@m:val)">
				        <xsl:apply-templates select="*"/>
			      </xsl:when>

			      <!-- Otherwise, create an mstyle and set the script level -->
			<xsl:otherwise>
				        <mstyle>
					          <xsl:attribute name="scriptlevel">
						            <xsl:value-of select="m:argPr[last()]/m:scrLvl/@m:val"/>
					          </xsl:attribute>
					          <xsl:apply-templates select="*"/>
				        </mstyle>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <xsl:template match="m:bar">
		    <xsl:variable name="sLowerCasePos"
                    select="translate(m:barPr/m:pos/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                           'abcdefghijklmnopqrstuvwxyz')"/>

		    <xsl:variable name="fTop">

			      <xsl:choose>
				        <xsl:when test="$sLowerCasePos='top'">1</xsl:when>
				        <xsl:otherwise>0</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:choose>
			      <xsl:when test="$fTop=1">
				        <mover>
					          <mrow>
						            <xsl:apply-templates select="m:e[1]"/>
					          </mrow>
					          <mo>
						            <xsl:text>&#x000AF;</xsl:text>
					          </mo>
				        </mover>
			      </xsl:when>
			      <xsl:otherwise>
				        <munder>
					          <mrow>
						            <xsl:apply-templates select="m:e[1]"/>
					          </mrow>
					          <mo>
						            <xsl:text>&#x00332;</xsl:text>
					          </mo>
				        </munder>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <!-- %%Template match m:d

		Process a delimiter. 
	-->
	<xsl:template match="m:d">
		    <mfenced>
			<!-- open: default is '(' for both OMML and MathML -->
			<xsl:if test="m:dPr[1]/m:begChr/@m:val and not(m:dPr[1]/m:begChr/@m:val ='(')">
				        <xsl:attribute name="open">
					          <xsl:value-of select="m:dPr[1]/m:begChr/@m:val"/>
				        </xsl:attribute>
			      </xsl:if>

			      <!-- close: default is ')' for both OMML and MathML -->
			<xsl:if test="m:dPr[1]/m:endChr/@m:val and not(m:dPr[1]/m:endChr/@m:val =')')">
				        <xsl:attribute name="close">
					          <xsl:value-of select="m:dPr[1]/m:endChr/@m:val"/>
				        </xsl:attribute>
			      </xsl:if>

			      <!-- separator: the default is ',' for MathML, and '|' for OMML -->
			<xsl:choose>
				<!-- Matches MathML default. Write nothing -->
				<xsl:when test="m:dPr[1]/m:sepChr/@m:val = ','"/>

				        <!-- OMML default: | -->
				<xsl:when test="not(m:dPr[1]/m:sepChr/@m:val)">
					          <xsl:attribute name="separators">
						            <xsl:value-of select="'|'"/>
					          </xsl:attribute>
				        </xsl:when>

				        <xsl:otherwise>
					          <xsl:attribute name="separators">
						            <xsl:value-of select="m:dPr[1]/m:sepChr/@m:val"/>
					          </xsl:attribute>
				        </xsl:otherwise>
			      </xsl:choose>

			      <!-- now write all the children. Put each one into an mrow
			just in case it produces multiple runs, etc -->
			<xsl:for-each select="m:e">
				        <mrow>
					          <xsl:apply-templates select="."/>
				        </mrow>
			      </xsl:for-each>
		    </mfenced>
	  </xsl:template>

	  <xsl:template match="m:r">
		    <xsl:variable name="sLowerCaseNor"
                    select="translate(child::m:rPr[last()]/m:nor/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                           'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:variable name="sLowerCaseLit"
                    select="translate(child::m:rPr[child::m:lit][last()]/@m:val, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                                           'abcdefghijklmnopqrstuvwxyz')"/>

		    <xsl:variable name="fNor">
			      <xsl:choose>
				        <xsl:when test="$sLowerCaseNor='off' or count(child::m:rPr[last()]/m:nor) = 0">0</xsl:when>
				        <xsl:otherwise>1</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>
		    <xsl:variable name="fLit">
			      <xsl:choose>
				        <xsl:when test="not(child::m:rPr[child::m:lit][last()]) or $sLowerCaseLit='off'">0</xsl:when>
				        <xsl:otherwise>1</xsl:otherwise>
			      </xsl:choose>
		    </xsl:variable>

		    <xsl:choose>
			      <xsl:when test="$fNor=1">
				        <xsl:choose>
					          <xsl:when test="$fLit=1">
						            <maction actiontype="lit">
							              <mtext>
									<xsl:call-template name="checkDirectFormatting"/>
								                <xsl:value-of select=".//m:t"/>
							              </mtext>
						            </maction>
					          </xsl:when>
					          <xsl:otherwise>
						            <mtext>
									<xsl:call-template name="checkDirectFormatting"/>
							              <xsl:value-of select=".//m:t"/>
						            </mtext>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:choose>
					          <xsl:when test="$fLit=1">
						            <maction actiontype="lit">
							              <xsl:for-each select=".//m:t">
								                <xsl:call-template name="ParseMt">
									                  <xsl:with-param name="sToParse" select="text()"/>
									                  <xsl:with-param name="scr" select="../m:rPr[last()]/m:scr/@m:val"/>
									                  <xsl:with-param name="sty" select="../m:rPr[last()]/m:sty/@m:val"/>
									                  <xsl:with-param name="nor" select="../m:rPr[last()]/m:nor/@m:val"/>
								                </xsl:call-template>
							              </xsl:for-each>
						            </maction>
					          </xsl:when>
					          <xsl:otherwise>
						            <xsl:for-each select=".//m:t">
							              <xsl:call-template name="ParseMt">
								                <xsl:with-param name="sToParse" select="text()"/>
								                <xsl:with-param name="scr" select="../m:rPr[last()]/m:scr/@m:val"/>
								                <xsl:with-param name="sty" select="../m:rPr[last()]/m:sty/@m:val"/>
								                <xsl:with-param name="nor" select="../m:rPr[last()]/m:nor/@m:val"/>
							              </xsl:call-template>
						            </xsl:for-each>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>


	  <xsl:template name="CreateTokenAttributes">
		    <xsl:param name="scr"/>
		    <xsl:param name="sty"/>
		    <xsl:param name="nor"/>
		    <xsl:param name="nCharToPrint"/>
		    <xsl:param name="sTokenType"/>
		    <xsl:variable name="sLowerCaseNor"
                    select="translate($nor, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',                                                               'abcdefghijklmnopqrstuvwxyz')"/>
		    <xsl:choose>
			      <xsl:when test="$sLowerCaseNor = 'on'">
				        <xsl:attribute name="mathvariant">normal</xsl:attribute>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:variable name="mathvariant">
					          <xsl:choose>
						<!-- numbers don't care -->
						<xsl:when test="$sTokenType='mn'"/>

						            <xsl:when test="$scr='monospace'">monospace</xsl:when>
						            <xsl:when test="$scr='sans-serif' and $sty='i'">sans-serif-italic</xsl:when>
						            <xsl:when test="$scr='sans-serif' and $sty='b'">bold-sans-serif</xsl:when>
						            <xsl:when test="$scr='sans-serif' and $sty='bi'">sans-serif-bold-italic</xsl:when>
						            <xsl:when test="$scr='sans-serif'">sans-serif</xsl:when>
						            <xsl:when test="$scr='fraktur' and $sty='b'">bold-fraktur</xsl:when>
						            <xsl:when test="$scr='fraktur'">fraktur</xsl:when>
						            <xsl:when test="$scr='double-struck'">double-struck</xsl:when>
						            <xsl:when test="$scr='script' and $sty='b'">bold-script</xsl:when>
						            <xsl:when test="$scr='script'">script</xsl:when>
						            <xsl:when test="($scr='roman' or not($scr) or $scr='') and $sty='b'">bold</xsl:when>
						            <xsl:when test="($scr='roman' or not($scr) or $scr='') and $sty='i'">italic</xsl:when>
						            <xsl:when test="($scr='roman' or not($scr) or $scr='') and $sty='p'">normal</xsl:when>
						            <xsl:when test="($scr='roman' or not($scr) or $scr='') and $sty='bi'">bold-italic</xsl:when>
						            <xsl:otherwise/>
					          </xsl:choose>
				        </xsl:variable>
				        <xsl:variable name="fontweight">
					          <xsl:choose>
						            <xsl:when test="$sty='b' or $sty='bi'">bold</xsl:when>
						            <xsl:otherwise>normal</xsl:otherwise>
					          </xsl:choose>
				        </xsl:variable>
				        <xsl:variable name="fontstyle">
					          <xsl:choose>
						            <xsl:when test="$sty='p' or $sty='b'">normal</xsl:when>
						            <xsl:otherwise>italic</xsl:otherwise>
					          </xsl:choose>
				        </xsl:variable>

				        <!-- Writing of attributes begins here -->
				<xsl:choose>
					<!-- Don't write mathvariant for operators unless they want to be normal -->
					<xsl:when test="$sTokenType='mo' and $mathvariant!='normal'"/>

					          <!-- A single character within an mi is already italics, don't write -->
					<xsl:when test="$sTokenType='mi' and $nCharToPrint=1 and ($mathvariant='' or $mathvariant='italic')"/>

					          <xsl:when test="$sTokenType='mi' and $nCharToPrint &gt; 1 and ($mathvariant='' or $mathvariant='italic')">
						            <xsl:attribute name="mathvariant">
							              <xsl:value-of select="'italic'"/>
						            </xsl:attribute>
					          </xsl:when>
					          <xsl:when test="$mathvariant!='italic' and $mathvariant!=''">
						            <xsl:attribute name="mathvariant">
							              <xsl:value-of select="$mathvariant"/>
						            </xsl:attribute>
					          </xsl:when>
					          <xsl:otherwise>
						            <xsl:if test="not($sTokenType='mi' and $nCharToPrint=1) and $fontstyle='italic'">
							              <xsl:attribute name="fontstyle">italic</xsl:attribute>
						            </xsl:if>
						            <xsl:if test="$fontweight='bold'">
							              <xsl:attribute name="fontweight">bold</xsl:attribute>
						            </xsl:if>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <xsl:template match="m:eqArr">
		    <mtable>
			      <xsl:for-each select="m:e">
				        <mtr>
					          <mtd>
						            <xsl:choose>
							              <xsl:when test="m:argPr[last()]/m:scrLvl/@m:val!='0' or                   not(m:argPr[last()]/m:scrLvl/@m:val)  or                   m:argPr[last()]/m:scrLvl/@m:val=''">
								                <mrow>
									                  <maligngroup/>
									                  <xsl:call-template name="CreateEqArrRow">
										                    <xsl:with-param name="align" select="1"/>
										                    <xsl:with-param name="ndCur" select="*[1]"/>
									                  </xsl:call-template>
								                </mrow>
							              </xsl:when>
							              <xsl:otherwise>
								                <mstyle>
									                  <xsl:attribute name="scriptlevel">
										                    <xsl:value-of select="m:argPr[last()]/m:scrLvl/@m:val"/>
									                  </xsl:attribute>
									                  <maligngroup/>
									                  <xsl:call-template name="CreateEqArrRow">
										                    <xsl:with-param name="align" select="1"/>
										                    <xsl:with-param name="ndCur" select="*[1]"/>
									                  </xsl:call-template>
								                </mstyle>
							              </xsl:otherwise>
						            </xsl:choose>
					          </mtd>
				        </mtr>
			      </xsl:for-each>
		    </mtable>
	  </xsl:template>

	  <xsl:template name="CreateEqArrRow">
		    <xsl:param name="align"/>
		    <xsl:param name="ndCur"/>
		    <xsl:variable name="sAllMt">
			      <xsl:for-each select="$ndCur/m:t">
				        <xsl:value-of select="."/>
			      </xsl:for-each>
		    </xsl:variable>
		    <xsl:choose>
			      <xsl:when test="$ndCur/self::m:r">
				        <xsl:call-template name="ParseEqArrMr">
					          <xsl:with-param name="sToParse" select="$sAllMt"/>
					          <xsl:with-param name="scr" select="../m:rPr[last()]/m:scr/@m:val"/>
					          <xsl:with-param name="sty" select="../m:rPr[last()]/m:sty/@m:val"/>
					          <xsl:with-param name="nor" select="../m:rPr[last()]/m:nor/@m:val"/>
					          <xsl:with-param name="align" select="$align"/>
				        </xsl:call-template>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:apply-templates select="$ndCur"/>
			      </xsl:otherwise>
		    </xsl:choose>
		    <xsl:if test="count($ndCur/following-sibling::*) &gt; 0">
			      <xsl:variable name="cAmp">
				        <xsl:call-template name="CountAmp">
					          <xsl:with-param name="sAllMt" select="$sAllMt"/>
					          <xsl:with-param name="cAmp" select="0"/>
				        </xsl:call-template>
			      </xsl:variable>
			      <xsl:call-template name="CreateEqArrRow">
				        <xsl:with-param name="align" select="($align+($cAmp mod 2)) mod 2"/>
				        <xsl:with-param name="ndCur" select="$ndCur/following-sibling::*[1]"/>
			      </xsl:call-template>
		    </xsl:if>
	  </xsl:template>

	  <xsl:template name="CountAmp">
		    <xsl:param name="sAllMt"/>
		    <xsl:param name="cAmp"/>
		    <xsl:choose>
			      <xsl:when test="string-length(substring-after($sAllMt, '&amp;')) &gt; 0 or                     substring($sAllMt, string-length($sAllMt))='&amp;'">
				        <xsl:call-template name="CountAmp">
					          <xsl:with-param name="sAllMt" select="substring-after($sAllMt, '&amp;')"/>
					          <xsl:with-param name="cAmp" select="$cAmp+1"/>
				        </xsl:call-template>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:value-of select="$cAmp"/>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <!-- %%Template: ParseEqArrMr
			
			Similar to ParseMt, but this one has to do more for an equation array. 
      In equation arrays &amp; is a special character which denotes alignment.
      
      The &amp; in an equation works by alternating between meaning insert alignment spacing
      and insert alignment mark.  For each equation in the equation array
      there is an implied align space at the beginning of the equation.  Within each equation,
      the first &amp; means alignmark, the second, align space, the third, alignmark, etc.
      
      For this reason when parsing m:r's in equation arrays it is important to keep track of what
      the next ampersand will mean.
      
      $align=0 => Omml's align space, which is similar to MathML's maligngroup.
      $align=1 => Omml's alignment mark, which is similar to MathML's malignmark.
	-->
	<xsl:template name="ParseEqArrMr">
		    <xsl:param name="sToParse"/>
		    <xsl:param name="sty"/>
		    <xsl:param name="scr"/>
		    <xsl:param name="nor"/>
		    <xsl:param name="align"/>

		    <xsl:if test="string-length($sToParse) &gt; 0">
			      <xsl:choose>
				        <xsl:when test="substring($sToParse,1,1) = '&amp;'">
					          <xsl:choose>
						            <xsl:when test="$align=0">
							              <maligngroup/>
						            </xsl:when>
						            <xsl:when test="$align=1">
							              <malignmark/>
						            </xsl:when>
					          </xsl:choose>
					          <xsl:call-template name="ParseEqArrMr">
						            <xsl:with-param name="sToParse" select="substring($sToParse,2)"/>
						            <xsl:with-param name="scr" select="$scr"/>
						            <xsl:with-param name="sty" select="$sty"/>
						            <xsl:with-param name="nor" select="$nor"/>
						            <xsl:with-param name="align">
							              <xsl:choose>
								                <xsl:when test="$align=1">0</xsl:when>
								                <xsl:otherwise>1</xsl:otherwise>
							              </xsl:choose>
						            </xsl:with-param>
					          </xsl:call-template>
				        </xsl:when>
				        <xsl:otherwise>
					          <xsl:variable name="sRepNumWith0">
						            <xsl:call-template name="SReplaceNumWithZero">
							              <xsl:with-param name="sToParse" select="$sToParse"/>
						            </xsl:call-template>
					          </xsl:variable>
					          <xsl:variable name="sRepOperWith-">
						            <xsl:call-template name="SReplaceOperWithMinus">
							              <xsl:with-param name="sToParse" select="$sRepNumWith0"/>
						            </xsl:call-template>
					          </xsl:variable>

					          <xsl:variable name="iFirstOper"
                             select="string-length($sRepOperWith-) - string-length(substring-after($sRepOperWith-, '-'))"/>
					          <xsl:variable name="iFirstNum"
                             select="string-length($sRepOperWith-) - string-length(substring-after($sRepOperWith-, '0'))"/>
					          <xsl:variable name="iFirstAmp"
                             select="string-length($sRepOperWith-) - string-length(substring-after($sRepOperWith-, '&amp;'))"/>
					          <xsl:variable name="fNumAtPos1">
						            <xsl:choose>
							              <xsl:when test="substring($sRepOperWith-,1,1)='0'">1</xsl:when>
							              <xsl:otherwise>0</xsl:otherwise>
						            </xsl:choose>
					          </xsl:variable>
					          <xsl:variable name="fOperAtPos1">
						            <xsl:choose>
							              <xsl:when test="substring($sRepOperWith-,1,1)='-'">1</xsl:when>
							              <xsl:otherwise>0</xsl:otherwise>
						            </xsl:choose>
					          </xsl:variable>
					          <xsl:choose>

						<!-- Case I: The string begins with neither a number, nor an operator -->
						<xsl:when test="$fNumAtPos1='0' and $fOperAtPos1='0'">
							              <mi>
								                <xsl:call-template name="CreateTokenAttributes">
									                  <xsl:with-param name="scr" select="$scr"/>
									                  <xsl:with-param name="sty" select="$sty"/>
									                  <xsl:with-param name="nor" select="$nor"/>
									                  <xsl:with-param name="nCharToPrint" select="1"/>
									                  <xsl:with-param name="sTokenType" select="'mi'"/>
								                </xsl:call-template>
								                <xsl:value-of select="substring($sToParse,1,1)"/>
							              </mi>
							              <xsl:call-template name="ParseEqArrMr">
								                <xsl:with-param name="sToParse" select="substring($sToParse, 2)"/>
								                <xsl:with-param name="scr" select="$scr"/>
								                <xsl:with-param name="sty" select="$sty"/>
								                <xsl:with-param name="nor" select="$nor"/>
								                <xsl:with-param name="align" select="$align"/>
							              </xsl:call-template>
						            </xsl:when>

						            <!-- Case II: There is an operator at position 1 -->
						<xsl:when test="$fOperAtPos1='1'">
							              <mo>
								                <xsl:call-template name="CreateTokenAttributes">
									                  <xsl:with-param name="scr"/>
									                  <xsl:with-param name="sty"/>
									                  <xsl:with-param name="nor" select="$nor"/>
									                  <xsl:with-param name="sTokenType" select="'mo'"/>
								                </xsl:call-template>
								                <xsl:value-of select="substring($sToParse,1,1)"/>
							              </mo>
							              <xsl:call-template name="ParseEqArrMr">
								                <xsl:with-param name="sToParse" select="substring($sToParse, 2)"/>
								                <xsl:with-param name="scr" select="$scr"/>
								                <xsl:with-param name="sty" select="$sty"/>
								                <xsl:with-param name="nor" select="$nor"/>
								                <xsl:with-param name="align" select="$align"/>
							              </xsl:call-template>
						            </xsl:when>

						            <!-- Case III: There is a number at position 1 -->
						<xsl:otherwise>
							              <xsl:variable name="sConsecNum">
								                <xsl:call-template name="SNumStart">
									                  <xsl:with-param name="sToParse" select="$sToParse"/>
									                  <xsl:with-param name="sPattern" select="$sRepNumWith0"/>
								                </xsl:call-template>
							              </xsl:variable>
							              <mn>
								                <xsl:call-template name="CreateTokenAttributes">
									                  <xsl:with-param name="scr"/>
									                  <xsl:with-param name="sty" select="'p'"/>
									                  <xsl:with-param name="nor" select="$nor"/>
									                  <xsl:with-param name="sTokenType" select="'mn'"/>
								                </xsl:call-template>
								                <xsl:value-of select="$sConsecNum"/>
							              </mn>
							              <xsl:call-template name="ParseEqArrMr">
								                <xsl:with-param name="sToParse" select="substring-after($sToParse, $sConsecNum)"/>
								                <xsl:with-param name="scr" select="$scr"/>
								                <xsl:with-param name="sty" select="$sty"/>
								                <xsl:with-param name="nor" select="$nor"/>
								                <xsl:with-param name="align" select="$align"/>
							              </xsl:call-template>
						            </xsl:otherwise>
					          </xsl:choose>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:if>
	  </xsl:template>

	  <!-- %%Template: ParseMt

			Produce a run of text. Technically, OMML makes no distinction 
			between numbers, operators, and other characters in a run. For 
			MathML we need to break these into mi, mn, or mo elements. 
			
			See also ParseEqArrMr
	-->
	<xsl:template name="ParseMt">
		    <xsl:param name="sToParse"/>
		    <xsl:param name="sty"/>
		    <xsl:param name="scr"/>
		    <xsl:param name="nor"/>
		    <xsl:if test="string-length($sToParse) &gt; 0">
			      <xsl:variable name="sRepNumWith0">
				        <xsl:call-template name="SReplaceNumWithZero">
					          <xsl:with-param name="sToParse" select="$sToParse"/>
				        </xsl:call-template>
			      </xsl:variable>
			      <xsl:variable name="sRepOperWith-">
				        <xsl:call-template name="SReplaceOperWithMinus">
					          <xsl:with-param name="sToParse" select="$sRepNumWith0"/>
				        </xsl:call-template>
			      </xsl:variable>

			      <xsl:variable name="iFirstOper"
                       select="string-length($sRepOperWith-) - string-length(substring-after($sRepOperWith-, '-'))"/>
			      <xsl:variable name="iFirstNum"
                       select="string-length($sRepOperWith-) - string-length(substring-after($sRepOperWith-, '0'))"/>
			      <xsl:variable name="fNumAtPos1">
				        <xsl:choose>
					          <xsl:when test="substring($sRepOperWith-,1,1)='0'">1</xsl:when>
					          <xsl:otherwise>0</xsl:otherwise>
				        </xsl:choose>
			      </xsl:variable>
			      <xsl:variable name="fOperAtPos1">
				        <xsl:choose>
					          <xsl:when test="substring($sRepOperWith-,1,1)='-'">1</xsl:when>
					          <xsl:otherwise>0</xsl:otherwise>
				        </xsl:choose>
			      </xsl:variable>

			      <xsl:choose>

				<!-- Case I: The string begins with neither a number, nor an operator -->
				<xsl:when test="$fOperAtPos1='0' and $fNumAtPos1='0'">
					          <xsl:variable name="nCharToPrint">
						            <xsl:choose>
							              <xsl:when test="ancestor::m:fName">
								                <xsl:choose>
									                  <xsl:when test="($iFirstOper=$iFirstNum) and             ($iFirstOper=string-length($sToParse)) and                        (substring($sRepOperWith-, string-length($sRepOperWith-))!='0') and                         (substring($sRepOperWith-, string-length($sRepOperWith-))!='-')">
										                    <xsl:value-of select="string-length($sToParse)"/>
									                  </xsl:when>
									                  <xsl:when test="$iFirstOper &lt; $iFirstNum">
										                    <xsl:value-of select="$iFirstOper - 1"/>
									                  </xsl:when>
									                  <xsl:otherwise>
										                    <xsl:value-of select="$iFirstNum - 1"/>
									                  </xsl:otherwise>
								                </xsl:choose>
							              </xsl:when>
							              <xsl:otherwise>1</xsl:otherwise>
						            </xsl:choose>
					          </xsl:variable>

					          <mi>
						            <xsl:call-template name="CreateTokenAttributes">
							              <xsl:with-param name="scr" select="$scr"/>
							              <xsl:with-param name="sty" select="$sty"/>
							              <xsl:with-param name="nor" select="$nor"/>
							              <xsl:with-param name="nCharToPrint" select="$nCharToPrint"/>
							              <xsl:with-param name="sTokenType" select="'mi'"/>
						            </xsl:call-template>
						            <xsl:value-of select="substring($sToParse, 1, $nCharToPrint)"/>
					          </mi>
					          <xsl:call-template name="ParseMt">
						            <xsl:with-param name="sToParse" select="substring($sToParse, $nCharToPrint+1)"/>
						            <xsl:with-param name="scr" select="$scr"/>
						            <xsl:with-param name="sty" select="$sty"/>
						            <xsl:with-param name="nor" select="$nor"/>
					          </xsl:call-template>
				        </xsl:when>

				        <!-- Case II: There is an operator at position 1 -->
				<xsl:when test="$fOperAtPos1='1'">
					          <mo>
						            <xsl:call-template name="CreateTokenAttributes">
							              <xsl:with-param name="scr"/>
							              <xsl:with-param name="sty"/>
							              <xsl:with-param name="nor" select="$nor"/>
							              <xsl:with-param name="sTokenType" select="'mo'"/>
						            </xsl:call-template>
						            <xsl:value-of select="substring($sToParse,1,1)"/>
					          </mo>
					          <xsl:call-template name="ParseMt">
						            <xsl:with-param name="sToParse" select="substring($sToParse, 2)"/>
						            <xsl:with-param name="scr" select="$scr"/>
						            <xsl:with-param name="sty" select="$sty"/>
						            <xsl:with-param name="nor" select="$nor"/>
					          </xsl:call-template>
				        </xsl:when>

				        <!-- Case III: There is a number at position 1 -->
				<xsl:otherwise>
					          <xsl:variable name="sConsecNum">
						            <xsl:call-template name="SNumStart">
							              <xsl:with-param name="sToParse" select="$sToParse"/>
							              <xsl:with-param name="sPattern" select="$sRepNumWith0"/>
						            </xsl:call-template>
					          </xsl:variable>
					          <mn>
						            <xsl:call-template name="CreateTokenAttributes">
							              <xsl:with-param name="scr" select="$scr"/>
							              <xsl:with-param name="sty" select="'p'"/>
							              <xsl:with-param name="nor" select="$nor"/>
							              <xsl:with-param name="sTokenType" select="'mn'"/>
						            </xsl:call-template>
						            <xsl:value-of select="$sConsecNum"/>
					          </mn>
					          <xsl:call-template name="ParseMt">
						            <xsl:with-param name="sToParse" select="substring-after($sToParse, $sConsecNum)"/>
						            <xsl:with-param name="scr" select="$scr"/>
						            <xsl:with-param name="sty" select="$sty"/>
						            <xsl:with-param name="nor" select="$nor"/>
					          </xsl:call-template>
				        </xsl:otherwise>
			      </xsl:choose>
		    </xsl:if>
	  </xsl:template>

	  <!-- %%Template: SNumStart 
	
		Return the longest substring of sToParse starting from the 
		start of sToParse that is a number. In addition, it takes the
		pattern string, which is sToParse with all of its numbers 
		replaced with a 0. sPattern should be the same length 
		as sToParse		
	-->
	<xsl:template name="SNumStart">
		    <xsl:param name="sToParse" select="''"/>
		    <!-- if we don't get anything, take the string itself -->
		<xsl:param name="sPattern" select="'$sToParse'"/>


		    <xsl:choose>
			<!-- the pattern says this is a number, recurse with the rest -->
			<xsl:when test="substring($sPattern, 1, 1) = '0'">
				        <xsl:call-template name="SNumStart">
					          <xsl:with-param name="sToParse" select="$sToParse"/>
					          <xsl:with-param name="sPattern" select="substring($sPattern, 2)"/>
				        </xsl:call-template>
			      </xsl:when>

			      <!-- the pattern says we've run out of numbers. Take as many
				characters from sToParse as we shaved off sPattern -->
			<xsl:otherwise>
				        <xsl:value-of select="substring($sToParse, 1, string-length($sToParse) - string-length($sPattern))"/>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>

	  <!-- %%Template SRepeatCharAcc
	
			The core of SRepeatChar with an accumulator. The current
			string is in param $acc, and we will double and recurse,
			if we're less than half of the required length or else just 
			add the right amount of characters to the accumulator and
			return
	-->
	<xsl:template name="SRepeatCharAcc">
		    <xsl:param name="cchRequired" select="1"/>
		    <xsl:param name="ch" select="'-'"/>
		    <xsl:param name="acc" select="$ch"/>

		    <xsl:variable name="cchAcc" select="string-length($acc)"/>
		    <xsl:choose>
			      <xsl:when test="(2 * $cchAcc) &lt; $cchRequired">
				        <xsl:call-template name="SRepeatCharAcc">
					          <xsl:with-param name="cchRequired" select="$cchRequired"/>
					          <xsl:with-param name="ch" select="$ch"/>
					          <xsl:with-param name="acc" select="concat($acc, $acc)"/>
				        </xsl:call-template>
			      </xsl:when>

			      <xsl:otherwise>
				        <xsl:value-of select="concat($acc, substring($acc, 1, $cchRequired - $cchAcc))"/>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>


	  <!-- %%Template SRepeatChar
	
			Generates a string nchRequired long by repeating the given character ch
	-->
	<xsl:template name="SRepeatChar">
		    <xsl:param name="cchRequired" select="1"/>
		    <xsl:param name="ch" select="'-'"/>

		    <xsl:call-template name="SRepeatCharAcc">
			      <xsl:with-param name="cchRequired" select="$cchRequired"/>
			      <xsl:with-param name="ch" select="$ch"/>
			      <xsl:with-param name="acc" select="$ch"/>
		    </xsl:call-template>
	  </xsl:template>

	  <!-- %%Template SReplaceOperWithMinus
	
		Go through the given string and replace every instance
		of an operator with a minus '-'. This helps quickly identify
		the first instance of an operator.  
	-->
	<xsl:template name="SReplaceOperWithMinus">
		    <xsl:param name="sToParse" select="''"/>

		    <xsl:value-of select="translate($sToParse, $sOperators, $sMinuses)"/>
	  </xsl:template>

	  <!-- %%Template SReplaceNumWithZero
	
		Go through the given string and replace every instance
		of an number with a zero '0'. This helps quickly identify
		the first occurence of a number. 
		
		Considers the '.' and ',' part of a number iff they are sandwiched 
		between two other numbers. 0.3 will be recognized as a number,
		x.3 will not be. Since these characters can also be an operator, this 
		should be called before SReplaceOperWithMinus.
	-->
	<xsl:template name="SReplaceNumWithZero">
		    <xsl:param name="sToParse" select="''"/>

		    <!-- First do a simple replace. Numbers will all be come 0's.
			After this point, the pattern involving the . or , that 
			we are looking for will become 0.0 or 0,0 -->
		<xsl:variable name="sSimpleReplace" select="translate($sToParse, $sNumbers, $sZeros)"/>

		    <!-- And then, replace 0.0 with just 000. This means that the . will 
			become part of the number -->
		<xsl:variable name="sReplacePeriod">
			      <xsl:call-template name="SReplace">
				        <xsl:with-param name="sInput" select="$sSimpleReplace"/>
				        <xsl:with-param name="sOrig" select="'0.0'"/>
				        <xsl:with-param name="sReplacement" select="'000'"/>
			      </xsl:call-template>
		    </xsl:variable>

		    <!-- And then, replace 0,0 with just 000. This means that the , will 
			become part of the number -->
		<xsl:call-template name="SReplace">
			      <xsl:with-param name="sInput" select="$sReplacePeriod"/>
			      <xsl:with-param name="sOrig" select="'0,0'"/>
			      <xsl:with-param name="sReplacement" select="'000'"/>
		    </xsl:call-template>
	  </xsl:template>

	  <!-- Template to translate Word's borderBox properties into the menclose notation attribute
       The initial call to this SHOULD NOT pass an sAttribute.  Subsequent calls to 
       CreateMencloseNotationAttrFromBorderBoxAttr by CreateMencloseNotationAttrFromBorderBoxAttr will
       update the sAttribute as appropriate.
       
       CreateMencloseNotationAttrFromBorderBoxAttr looks at each attribute (fHideTop, fHideBot, etc.) one at a time
       in the order they are listed and passes a modified sAttribute to CreateMencloseNotationAttrFromBorderBoxAttr.
       Each successive call to CreateMencloseNotationAttrFromBorderBoxAttr knows which attribute to look at because 
       the previous call should have omitted passing the attribute it just analyzed.  This is why as you read lower 
       and lower in the template that each call to CreateMencloseNotationAttrFromBorderBoxAttr has fewer and fewer attributes.
       -->
	<xsl:template name="CreateMencloseNotationAttrFromBorderBoxAttr">
		    <xsl:param name="fHideTop"/>
		    <xsl:param name="fHideBot"/>
		    <xsl:param name="fHideLeft"/>
		    <xsl:param name="fHideRight"/>
		    <xsl:param name="fStrikeH"/>
		    <xsl:param name="fStrikeV"/>
		    <xsl:param name="fStrikeBLTR"/>
		    <xsl:param name="fStrikeTLBR"/>
		    <xsl:param name="sAttribute"/>

		    <xsl:choose>
			      <xsl:when test="string-length($sAttribute) = 0">
				        <xsl:choose>
					          <xsl:when test="string-length($fHideTop) &gt; 0                       and string-length($fHideBot) &gt; 0                        and string-length($fHideLeft) &gt; 0                       and string-length($fHideRight) &gt; 0">

						            <xsl:choose>
							              <xsl:when test="$fHideTop = 0                                and $fHideBot = 0                               and $fHideLeft = 0                                and $fHideRight = 0">
								<!-- We can use 'box' instead of top, bot, left, and right.  Therefore,
                  replace sAttribute with 'box' and begin analyzing params fStrikeH
                  and below. -->
								<xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute">
										                    <xsl:text>box</xsl:text>
									                  </xsl:with-param>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								<!-- Can't use 'box', theremore, must analyze all attributes -->
								<xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fHideTop" select="$fHideTop"/>
									                  <xsl:with-param name="fHideBot" select="$fHideBot"/>
									                  <xsl:with-param name="fHideLeft" select="$fHideLeft"/>
									                  <xsl:with-param name="fHideRight" select="$fHideRight"/>
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute">
										<!-- Assume using all four (left right top bottom).  Subsequent calls
                         will remove the sides which aren't to be includes. -->
										<xsl:text>left right top bottom</xsl:text>
									                  </xsl:with-param>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
				        </xsl:choose>
			      </xsl:when>
			      <xsl:otherwise>
				        <xsl:choose>
					          <xsl:when test="string-length($fHideTop) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fHideTop=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fHideBot" select="$fHideBot"/>
									                  <xsl:with-param name="fHideLeft" select="$fHideLeft"/>
									                  <xsl:with-param name="fHideRight" select="$fHideRight"/>
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute">
										                    <xsl:call-template name="SReplace">
											                      <xsl:with-param name="sInput" select="$sAttribute"/>
											                      <xsl:with-param name="sOrig" select="'top'"/>
											                      <xsl:with-param name="sReplacement" select="''"/>
										                    </xsl:call-template>
									                  </xsl:with-param>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fHideBot" select="$fHideBot"/>
									                  <xsl:with-param name="fHideLeft" select="$fHideLeft"/>
									                  <xsl:with-param name="fHideRight" select="$fHideRight"/>
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:when test="string-length($fHideBot) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fHideBot=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fHideLeft" select="$fHideLeft"/>
									                  <xsl:with-param name="fHideRight" select="$fHideRight"/>
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute">
										                    <xsl:call-template name="SReplace">
											                      <xsl:with-param name="sInput" select="$sAttribute"/>
											                      <xsl:with-param name="sOrig" select="'bottom'"/>
											                      <xsl:with-param name="sReplacement" select="''"/>
										                    </xsl:call-template>
									                  </xsl:with-param>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fHideLeft" select="$fHideLeft"/>
									                  <xsl:with-param name="fHideRight" select="$fHideRight"/>
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:when test="string-length($fHideLeft) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fHideLeft=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fHideRight" select="$fHideRight"/>
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute">
										                    <xsl:call-template name="SReplace">
											                      <xsl:with-param name="sInput" select="$sAttribute"/>
											                      <xsl:with-param name="sOrig" select="'left'"/>
											                      <xsl:with-param name="sReplacement" select="''"/>
										                    </xsl:call-template>
									                  </xsl:with-param>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fHideRight" select="$fHideRight"/>
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:when test="string-length($fHideRight) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fHideRight=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute">
										                    <xsl:call-template name="SReplace">
											                      <xsl:with-param name="sInput" select="$sAttribute"/>
											                      <xsl:with-param name="sOrig" select="'right'"/>
											                      <xsl:with-param name="sReplacement" select="''"/>
										                    </xsl:call-template>
									                  </xsl:with-param>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeH" select="$fStrikeH"/>
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:when test="string-length($fStrikeH) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fStrikeH=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="concat($sAttribute, ' horizontalstrike')"/>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeV" select="$fStrikeV"/>
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:when test="string-length($fStrikeV) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fStrikeV=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="concat($sAttribute, ' verticalstrike')"/>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeBLTR" select="$fStrikeBLTR"/>
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:when test="string-length($fStrikeBLTR) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fStrikeBLTR=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="concat($sAttribute, ' updiagonalstrike')"/>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="fStrikeTLBR" select="$fStrikeTLBR"/>
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:when test="string-length($fStrikeTLBR) &gt; 0">
						            <xsl:choose>
							              <xsl:when test="$fStrikeTLBR=1">
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="sAttribute" select="concat($sAttribute, ' downdiagonalstrike')"/>
								                </xsl:call-template>
							              </xsl:when>
							              <xsl:otherwise>
								                <xsl:call-template name="CreateMencloseNotationAttrFromBorderBoxAttr">
									                  <xsl:with-param name="sAttribute" select="$sAttribute"/>
								                </xsl:call-template>
							              </xsl:otherwise>
						            </xsl:choose>
					          </xsl:when>
					          <xsl:otherwise>
						            <xsl:attribute name="notation">
							              <xsl:value-of select="normalize-space($sAttribute)"/>
						            </xsl:attribute>
					          </xsl:otherwise>
				        </xsl:choose>
			      </xsl:otherwise>
		    </xsl:choose>
	  </xsl:template>


	  <xsl:template name="checkDirectFormatting">
	    <xsl:if test="w:rPr/w:rFonts/@w:ascii and not(w:rPr/w:rFonts/@w:ascii='Cambria Math')">
	      <xsl:attribute name="fontfamily" select="w:rPr/w:rFonts/@w:ascii"/>
	    </xsl:if>
	    <xsl:choose>
	      <xsl:when test="w:rPr/w:b[not(@w:val='0')]">
		<xsl:attribute name="fontweight">bold</xsl:attribute>
	      </xsl:when>
	      <xsl:when test="w:rPr/w:b[@w:val='0']">
		<xsl:attribute name="fontweight">normal</xsl:attribute>
	      </xsl:when>
	    </xsl:choose>
	    <xsl:choose>
	      <xsl:when test="w:rPr/w:i[not(@w:val='0')]">
		<xsl:attribute name="fontstyle">italic</xsl:attribute>
	      </xsl:when>
	      <xsl:when test="w:rPr/w:i[@w:val='0']">
		<xsl:attribute name="fontstyle">upright</xsl:attribute>
	      </xsl:when>
	    </xsl:choose>
	  </xsl:template>
</xsl:stylesheet>