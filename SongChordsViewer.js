/**
 * Song text viewer based on Vue
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 1.0
 * @license MIT
 *
 * @requires vue
 * @requires vue-i18n
 * @requires ChordView
 * @requires SongChordsParser
 */
import ChordView from './libs/ChordView/ChordView.js';
import SongChordsParser, {
    CHORD_ALIAS,
    CHORD_SHORTCUT,
    REPEAT_ALIAS,
    SPACER_ALIAS,
    SPACER_SHORTCUT,
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
import SongChordsViewerEntity, {
    SONG_VIEWER_EVENT_CHORD_FOUND
} from './entity/entity.vue';

/**
 * @const {object} messages
 */
import messages from './lang.json';

/**
 * @const {string} MODULE_ID
 */
const MODULE_ID = 'song-chords-viewer';

/**
 * @const {string} SONG_VIEWER_EVENT_CLEAR
 * @const {string} SONG_VIEWER_EVENT_PARSE
 * @const {string} SONG_VIEWER_EVENT_PARSED
 * @const {string} SONG_VIEWER_EVENT_CLEARED
 */
export const SONG_VIEWER_EVENT_CLEAR = `${MODULE_ID}-clear`;
export const SONG_VIEWER_EVENT_PARSE = `${MODULE_ID}-parse`;
export const SONG_VIEWER_EVENT_PARSED = `${MODULE_ID}-parsed`;
export const SONG_VIEWER_EVENT_CLEARED = `${MODULE_ID}-cleared`;

const REPEAT_DEFAULT_VALUE = 2;
const SPACER_DEFAULT_VALUE = 3;

const BLOCKS_LIST = [
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
];

const INLINES_LIST = [
    CHORD_ALIAS,
    CHORD_SHORTCUT,
    REPEAT_ALIAS,
    SPACER_ALIAS,
    SPACER_SHORTCUT
];

const INLINES_VALUES = {
    [CHORD_ALIAS]: 'Am',
    [CHORD_SHORTCUT]: 'Em',
    [REPEAT_ALIAS]: REPEAT_DEFAULT_VALUE,
    [SPACER_ALIAS]: 0,
    [SPACER_SHORTCUT]: SPACER_DEFAULT_VALUE
}

/**
 * @const {Array<string>} DEFAULT_TUNE
 */
const DEFAULT_TUNE = ['E', 'B', 'G', 'D', 'A', 'E'];

/**
 * @const {number} EDITOR_TIMER
 */
const EDITOR_TIMER = 300;

/**
 * @const {SongChordsParser} api
 */
const api = new SongChordsParser();

/**
 * @var {object} timer
 */
let timer = null;

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
        SongChordsViewerEntity
    },

    i18n: {messages},

    data() {
        return {
            CHORD_ALIAS,
            REPEAT_ALIAS,
            SPACER_ALIAS,
            VERSE_TYPE_NOTE,
            VERSE_TYPE_CHORUS,
            VERSE_TYPE_DEFAULT,
            VERSE_TYPE_ASTERISM,
            VERSE_TYPE_EPIGRAPH,
            AUTHOR_TYPE_DEFAULT,
            SONG_VIEWER_EVENT_CLEAR,
            SONG_VIEWER_EVENT_PARSE,
            SONG_VIEWER_EVENT_CHORD_FOUND,

            BLOCKS_LIST,
            INLINES_LIST,
            INLINES_VALUES,

            revision: 0,
            raw: '',
            song: null
        };
    },

    mounted() {
        if (this.text) {
            this.raw = this.text;

            this.parse(this.raw);
        }
    },

    watch: {

        raw(val, old) {
            if (timer) {
                clearTimeout(timer);

                timer = null;
            }

            setTimeout(() => {
                this.revision++;

                this.parse(val);
            }, EDITOR_TIMER);
        }

    },

    methods: {

        /**
         * @method clear
         * @fires SONG_VIEWER_EVENT_CLEARED
         */
        clear() {
            let root = this.$refs.chords;

            this.raw = '';

            this.song = null;

            root.innerHTML = '';

            api.clear();

            this.$emit(SONG_VIEWER_EVENT_CLEARED);
        },

        /**
         * @method parse
         * @param {string} raw
         * @fires SONG_VIEWER_EVENT_CLEARED
         */
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
                tune: this.tune ? this.tune : DEFAULT_TUNE,
                title: this.raw ? title : '',
                chords: chords,
                verses: verses,
                authors: authorsGroupedByType
            };

            root.innerHTML = '';

            if (chords && chords.length && root && this.chords) {
                this.song.chords = chords.map((item) => {
                    return this.parseChord(item, root);
                });
            }

            this.$emit(SONG_VIEWER_EVENT_PARSED, this.song);
        },

        /**
         * @method onEditorInput
         * @param {string} raw
         * @param {HTMLElement} root
         * @param {boolean} titled
         * @returns {object}
         */
        parseChord(raw, root, titled = true) {
            let title = titled !== false && raw[0] != '{' ?
                        raw.replace(/(_\S+)/, '') :
                        '';
            let chord = null;

            if (raw[0] == '{') {
                try {
                    chord = JSON.parse(raw.replace(
                        /(\{|, )([^:]+):/g,
                        '$1"$2":'
                    ));
                } catch(e) {}
            } else if (this.chords[raw]) {
                chord = this.chords[raw];
            }

            if (chord) {
                return new ChordView({
                    root,
                    tune: this.song.tune,
                    title,
                    chord
                });
            }

            return chord;
        },

        /**
         * @method onEditorInput
         * @param {Event} event
         */
        onEditorInput(event) {
            this.parse(this.raw);
        },

        /**
         * @method onBridgeChordsFound
         * @param {object} refs
         * @fires SONG_VIEWER_EVENT_CLEARED
         */
        onBridgeChordsFound(refs) {
            let al0 = '';
            let root = '';

            for (al0 in refs) {
                root = refs[al0];

                root.innerHTML = '';

                this.parseChord(al0, root, false);
            }
        },

        [SONG_VIEWER_EVENT_CLEAR]() {
            this.clear()
        },

        [SONG_VIEWER_EVENT_PARSE](raw) {
            this.parse(raw);
        }

    }

}
