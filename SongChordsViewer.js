/**
 * @requires vue-i18n
 * @requires ChordView
 * @requires SongChordsParser
 */
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

import messages from './lang.json';

const MODULE_ID = 'song-chords-viewer';

export const SONG_VIEWER_EVENT_CLEAR = `${MODULE_ID}-clear`;
export const SONG_VIEWER_EVENT_PARSE = `${MODULE_ID}-parse`;
export const SONG_VIEWER_EVENT_PARSED = `${MODULE_ID}-parsed`;
export const SONG_VIEWER_EVENT_CLEARED = `${MODULE_ID}-cleared`;

const DEFAULT_TUNE = ['E', 'B', 'G', 'D', 'A', 'E'];

const api = new SongChordsParser();

export default {

    name: MODULE_ID,

    props: [
        'text',
        'tune',
        'chords',
        'editor'
    ],

    emits: [
        SONG_VIEWER_EVENT_PARSED,
        SONG_VIEWER_EVENT_CLEARED
    ],

    components: {
        SongChordsViewerLine
    },

    i18n: {messages},

    data() {
        return {
            CHORD_ALIAS,
            REPEAT_ALIAS,
            SPACER_ALIAS,
            VERSE_TYPE_CHORUS,
            VERSE_TYPE_DEFAULT,
            VERSE_TYPE_ASTERISM,
            AUTHOR_TYPE_DEFAULT,
            SONG_VIEWER_EVENT_CLEAR,
            SONG_VIEWER_EVENT_PARSE,

            song: null
        };
    },

    mounted() {
        if (this.text) {
            this.parse(this.text);
        }
    },

    methods: {

        clear() {
            let root = this.$refs.chords;

            this.song = null;

            root.innerHTML = '';

            api.clear();

            this.$emit(SONG_VIEWER_EVENT_CLEARED);
        },

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
                chords: chords,
                verses: verses,
                authors: authorsGroupedByType
            };

            if (chords && chords.length && root && this.chords) {
                root.innerHTML = '';

                this.song.chords = chords.map((chord) => {
                    if (!this.chords[chord]) {
                        return;
                    }

                    return new ChordView({
                        root,
                        tune,
                        title: chord.replace(/(_\S+)/, ''),
                        chord: this.chords[chord]
                    });
                });
            }

            this.$emit(SONG_VIEWER_EVENT_PARSED, this.song);
        },

        [SONG_VIEWER_EVENT_CLEAR]() {
            this.clear()
        },

        [SONG_VIEWER_EVENT_PARSE](raw) {
            this.parse(raw);
        }

    }

}
