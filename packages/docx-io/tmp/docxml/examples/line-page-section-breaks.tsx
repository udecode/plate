// deno-lint-ignore-file jsx-key
/** @jsx Docx.jsx */

import Docx, { Break, Paragraph, Section, Text } from '../mod.ts';
/**
 * In `docxml` there are three ways to break up text: the Break component, the pageBreakType Section property, and the pageBreakBefore Paragraph property. Each has specific use cases.
 */
await Docx.fromJsx([
	<Section>
		<Paragraph>
			<Text>
				The Project Gutenberg eBook of Keats: Poems Published in 1820
			</Text>
		</Paragraph>
		<Paragraph>
			<Text>
				This ebook is for the use of anyone anywhere in the United
				States and most other parts of the world at no cost and with
				almost no restrictions whatsoever. You may copy it, give it away
				or re-use it under the terms of the Project Gutenberg License
				included with this ebook or online at www.gutenberg.org. If you
				are not located in the United States, you will have to check the
				laws of the country where you are located before using this
				eBook.
			</Text>
		</Paragraph>
	</Section>,
	/**
	 * The pageBreakType property dictates the page break behavior between new sections of a document. Here, "oddPage" ensures it the section will always start on the next odd page.
	 */
	<Section pageBreakType="oddPage">
		<Paragraph>
			<Text>Lamia. Part I.</Text>
		</Paragraph>
		<Paragraph>
			<Text>
				{/* The Break component creates a break within Text component, or a text run in Word. The Break component has a type property for setting the break to move the text to the next column, page, or line (i.e. "textWrapping") */}
				Upon a time, before the faery broods{' '}
				<Break type="textWrapping" />
				Drove Nymph and Satyr from the prosperous woods,
				<Break />
				Before King Oberon's bright diadem,
				<Break />
				Sceptre, and mantle, clasp'd with dewy gem,
				<Break />
				Frighted away the Dryads and the Fauns
				<Break />
				From rushes green, and brakes, and cowslip'd lawns,
				<Break />
				The ever-smitten Hermes empty left
				<Break />
				His golden throne, bent warm on amorous theft:
				<Break />
				From high Olympus had he stolen light,
				<Break />
				On this side of Jove's clouds, to escape the sight10
				<Break />
				Of his great summoner, and made retreat
				<Break />
				Into a forest on the shores of Crete.
				<Break />
				For somewhere in that sacred island dwelt
				<Break />
				A nymph, to whom all hoofed Satyrs knelt;
				<Break />
				At whose white feet the languid Tritons poured
				<Break />
				Pearls, while on land they wither'd and adored.
				<Break />
				Fast by the springs where she to bathe was wont,
				<Break />
				And in those meads where sometime she might haunt,
				<Break />
				Were strewn rich gifts, unknown to any Muse,
				<Break />
				Though Fancy's casket were unlock'd to choose.20
				<Break />
				Ah, what a world of love was at her feet!
				<Break />
				So Hermes thought, and a celestial heat
				<Break />
				Burnt from his winged heels to either ear,
				<Break />
				That from a whiteness, as the lily clear,
				<Break />
				Blush'd into roses 'mid his golden hair,
				<Break />
				Fallen in jealous curls about his shoulders bare.
				<Break />
				From vale to vale, from wood to wood, he flew,
				<Break />
				Breathing upon the flowers his passion new,
				<Break />
				And wound with many a river to its head,
				<Break />
				To find where this sweet nymph prepar'd her secret bed:30
				<Break />
				In vain; the sweet nymph might nowhere be found,
				<Break />
				And so he rested, on the lonely ground,
				<Break />
				Pensive, and full of painful jealousies
				<Break />
				Of the Wood-Gods, and even the very trees.
				<Break />
				There as he stood, he heard a mournful voice,
				<Break />
				Such as once heard, in gentle heart, destroys
				<Break />
				All pain but pity: thus the lone voice spake:
				<Break />
				"When from this wreathed tomb shall I awake!
				<Break />
				When move in a sweet body fit for life,
				<Break />
				And love, and pleasure, and the ruddy strife40
				<Break />
				Of hearts and lips! Ah, miserable me!"
				<Break />
				The God, dove-footed, glided silently
				<Break />
				Round bush and tree, soft-brushing, in his speed,
				<Break />
				The taller grasses and full-flowering weed,
				<Break />
				Until he found a palpitating snake,
				<Break />
				Bright, and cirque-couchant in a dusky brake.
				<Break />
				...
				<Break />
			</Text>
		</Paragraph>
	</Section>,
	<Section>
		<Paragraph>
			<Text>Lamia. Part II.</Text>
		</Paragraph>
		<Paragraph>
			<Text>
				Love in a hut, with water and a crust,
				<Break />
				Is—Love, forgive us!—cinders, ashes, dust;
				<Break />
				Love in a palace is perhaps at last
				<Break />
				More grievous torment than a hermit's fast:—
				<Break />
				That is a doubtful tale from faery land,
				<Break />
				Hard for the non-elect to understand.
				<Break />
				Had Lycius liv'd to hand his story down,
				<Break />
				He might have given the moral a fresh frown,
				<Break />
				Or clench'd it quite: but too short was their bliss
				<Break />
				To breed distrust and hate, that make the soft voice hiss.
				<Break />
				Besides, there, nightly, with terrific glare
				<Break />
				Love, jealous grown of so complete a pair,
				<Break />
				Hover'd and buzz'd his wings, with fearful roar,
				<Break />
				Above the lintel of their chamber door,
				<Break />
				And down the passage cast a glow upon the floor.
				<Break />
			</Text>
		</Paragraph>
		{/* The pageBreakBefore property ensure that a page break will always be placed before this paragraph. */}
		<Paragraph pageBreakBefore>
			<Text>
				For all this came a ruin: side by side
				<Break />
				They were enthroned, in the even tide,
				<Break />
				Upon a couch, near to a curtaining
				<Break />
				Whose airy texture, from a golden string,
				<Break />
				Floated into the room, and let appear
				<Break />
				Unveil'd the summer heaven, blue and clear,
				<Break />
				Betwixt two marble shafts:—there they reposed,
				<Break />
				Where use had made it sweet, with eyelids closed,
				<Break />
				Saving a tythe which love still open kept,
				<Break />
				That they might see each other while they almost slept;
				<Break />
				When from the slope side of a suburb hill,
				<Break />
				Deafening the swallow's twitter, came a thrill
				<Break />
				Of trumpets—Lycius started—the sounds fled,
				<Break />
				But left a thought, a buzzing in his head.
				<Break />
				For the first time, since first he harbour'd in
				<Break />
				That purple-lined palace of sweet sin,
				<Break />
				His spirit pass'd beyond its golden bourn
				<Break />
				Into the noisy world almost forsworn.
				<Break />
				The lady, ever watchful, penetrant,
				<Break />
				Saw this with pain, so arguing a want
				<Break />
				Of something more, more than her empery
				<Break />
				Of joys; and she began to moan and sigh
				<Break />
				Because he mused beyond her, knowing well
				<Break />
				That but a moment's thought is passion's passing bell.
				<Break />
			</Text>
		</Paragraph>
	</Section>,
]).toFile('line-page-section-breaks.docx');
