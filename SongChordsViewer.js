import ChordView from './libs/ChordView/ChordView.js';
import SongChordsParser, {
    CHORD_ALIAS,
    REPEAT_ALIAS,
    SPACER_ALIAS,
    VERSE_TYPE_CODA,
    VERSE_TYPE_NOTE,
    VERSE_TYPE_CHORUS,
    VERSE_TYPE_INTRO,
    VERSE_TYPE_BRIDGE,
    VERSE_TYPE_DEFAULT,
    VERSE_TYPE_ASTERISM,
    VERSE_TYPE_EPIGRAPH,
    AUTHOR_TYPE_MUSIC,
    AUTHOR_TYPE_LYRICS,
    AUTHOR_TYPE_ARTIST,
    AUTHOR_TYPE_DEFAULT,
    AUTHOR_TYPE_TRANSLATION
} from './libs/SongChordsParser/SongChordsParser.js';
import SongChordsViewerLine from './line/line.vue';

const MODULE_ID = 'song-chords-viewer';

export const SONG_VIEWER_EVENT_PARSE = `${MODULE_ID}-parse`;
export const SONG_VIEWER_EVENT_PARSED = `${MODULE_ID}-parsed`;

const DEFAULT_TUNE = ['E', 'B', 'G', 'D', 'A', 'E'];

const api = new SongChordsParser();

export default {

    name: MODULE_ID,

    props: [
        'lang',
        'text',
        'tune',
        'chords'
    ],

    components: {
        SongChordsViewerLine
    },

    data() {
        return {
            CHORD_ALIAS,
            REPEAT_ALIAS,
            SPACER_ALIAS,
            VERSE_TYPE_DEFAULT,
            AUTHOR_TYPE_DEFAULT,

            song: null
        };
    },

    created() {
        this.$on(SONG_VIEWER_EVENT_PARSE, this.parse);
    },

    mounted() {
        if (this.text) {
            this.parse(this.text);
        }
    },

    methods: {

        parse(raw = '') {
            let tune = this.tune || DEFAULT_TUNE;
            let root = this.$refs.chords;

            api.parse(raw);

            let {
                title,
                chords,
                verses,
                authorsGroupedByType
            } = api;

            this.song = {
                title,
                chords: chords.slice(),
                verses: verses.slice(),
                authors: authorsGroupedByType.slice()
            };

            if (chords && chords.length && root && this.chords) {
                root.innerHTML = '';

                this.song.chords = chords.map((chord) => {
                    if (!collection[chord]) {
                        return;
                    }

                    return new ChordView({
                        root,
                        tune,
                        title: chord.replace(/(_\S+)/, ''),
                        chord: collection[chord]
                    });
                });
            }

            this.$emit(SONG_VIEWER_EVENT_PARSED, this.song);
        }

    }

}

