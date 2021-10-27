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
    BLOCKS_LIST,
    INLINES_LIST,
    FLAT_REXP,
    FLAT_SYMBOL,
    BEKAR_SYMBOL,
    SHARP_REXP,
    SHARP_SYMBOL,
    CHORD_ALIAS,
    CHORD_SHORTCUT,
    REPEAT_ALIAS,
    SPACER_ALIAS,
    SPACER_SHORTCUT,
    TITLE_ALIAS,
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
    AUTHOR_TYPE_TRANSLATION,
    orderChords
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
 * @const {string} SONG_VIEWER_EVENT_SEARCHED
 */
export const SONG_VIEWER_EVENT_CLEAR = `${MODULE_ID}-clear`;
export const SONG_VIEWER_EVENT_PARSE = `${MODULE_ID}-parse`;
export const SONG_VIEWER_EVENT_PARSED = `${MODULE_ID}-parsed`;
export const SONG_VIEWER_EVENT_CLEARED = `${MODULE_ID}-cleared`;
export const SONG_VIEWER_EVENT_SEARCHED = `${MODULE_ID}-searched`;

const CHORD_CANVAS_CLASS = 'song__chart';

/**
 * @const {number} REPEAT_DEFAULT_VALUE
 */
const REPEAT_DEFAULT_VALUE = 2;

/**
 * @const {number} SPACER_DEFAULT_VALUE
 */
const SPACER_DEFAULT_VALUE = 3;

/**
 * @const {object} INLINES_VALUES
 */
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

            processing: false,
            revision: 0,
            suggested: 0,
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

            timer = setTimeout(() => {
                this.revision++;

                this.parse(val);
                this.search();
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
            let suggest = this.$refs.suggest;

            // Clear model
            this.raw = '';

            // Remove template vars
            this.song = null;

            // Clear chords root node
            root.innerHTML = '';

            // Clear suggest root node
            suggest.innerHTML = '';

            // Clear api
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

            // Get a tree
            api.parse(raw);

            // Get main sections
            let {
                title,
                chords,
                verses,
                authorsGroupedByType
            } = api;

            // Save main sections for template
            this.song = {
                tune: this.tune ? this.tune : DEFAULT_TUNE,
                title: this.raw ? title : '',
                chords: chords,
                verses: verses,
                authors: authorsGroupedByType
            };

            // Clear chords root node
            root.innerHTML = '';

            // Draw chords
            if (chords && chords.length && root && this.chords) {
                this.song.chords = chords.map((item) => {
                    return this.parseChord(item, root);
                });
            }

            this.$emit(SONG_VIEWER_EVENT_PARSED, this.song);
        },

        /**
         * @method search
         * @fires SONG_VIEWER_EVENT_CLEARED
         */
        search() {
            let pos = this.$refs.editor.selectionStart;
            let it0 = 0;
            let ln0 = 0;
            let val = this.raw;
            let seek = '';
            let chord = '';
            let beg = null;
            let end = null;
            let found = [];
            let stack = null;

            // Try to find [c="...
            beg = val.substring(0, pos).match(/(\[c="([^"]*))$/)

            // If [c="... found
            if (beg) {
                seek = beg[2];

                // Try to find ..."]
                if (val.length - 1 > pos) {
                    end = val.substring(pos).match(/^([^"]+)"+\]?/);
                }

                // If ..."] found
                if (end) {
                    seek += end[1];
                }

                // Compile search string
                seek = this.fixChord(seek);
            }

            // Clean previous results
            this.suggested = 0;
            this.$refs.suggest.innerHTML = '';

            // Search
            if (seek) {
                stack = Object.getOwnPropertyNames(this.chords);
                found = [];

                // Iterate through chords object
                for (ln0 = stack.length; it0 < ln0; it0++) {
                    if (stack[it0].indexOf(seek) === 0) {
                        found.push(stack[it0]);
                    }
                }

                // Order chords list
                found.sort(orderChords);

                // Show suggest block
                this.suggested = found.length;

                // Render chords
                for (it0 = 0, ln0 = found.length; it0 < ln0; it0++) {
                    this.parseChord(found[it0], this.$refs.suggest, true, true);
                }

                this.$emit(SONG_VIEWER_EVENT_SEARCHED, {seek, found});
            }
        },

        /**
         * @method fixChord
         * @param {string} raw
         * @returns {string}
         */
        fixChord(raw) {
            return `${raw}`.
                   replace(SHARP_REXP, `$1${SHARP_SYMBOL}`).
                   replace(FLAT_REXP, `$1${FLAT_SYMBOL}`);
        },

        /**
         * @method onEditorInput
         * @param {string} raw
         * @param {HTMLElement} root
         * @param {boolean} titled
         * @param {boolean} full
         * @returns {object}
         */
        parseChord(raw, root, titled = true, full = false) {
            let alias = this.fixChord(raw);
            let title = '';
            let chord = null;

            if (raw[0] == '{') {
                try {
                    chord = JSON.parse(raw);
                    chord.root = root;
                    chord.tune = this.song.tune;
                    chord.cname = CHORD_CANVAS_CLASS;
                } catch(e) {}
            } else if (this.chords[alias]) {
                title = titled ? alias : '';
                title = !full ? title.replace(/(_\S+)$/, '') : title;

                chord = {
                    root: root,
                    tune: this.song.tune,
                    chord: this.chords[alias],
                    cname: CHORD_CANVAS_CLASS,
                    title
                };
            }

            if (chord) {
                return new ChordView(chord);
            }

            return chord;
        },

        /**
         * @method insertBlock
         * @param {string} tag
         * @param {number} beg
         * @param {number} end
         */
        insertBlock(tag, beg, end) {
            let pos = beg + `[${tag}]`.length;
            let str = this.raw.substring(beg, end);
            let out = `[${tag}]${str}[/${tag}]`;

            // Compile new value
            out = this.raw.substring(0, beg) +
                  `${out}` +
                  this.raw.substring(end);

            this.raw = out;

            // Move cursor
            setTimeout(() => {
                this.$refs.editor.focus();
                this.$refs.editor.setSelectionRange(pos, pos);
            }, 0);
        },

        /**
         * @method insertInline
         * @param {string} tag
         * @param {number} beg
         */
        insertInline(tag, beg, end) {
            let pos = beg + `[${tag}="`.length;
            let str = '';
            let out = `[${tag}=""]`;

            // Add endint tag for [repeat]
            if (tag == REPEAT_ALIAS) {
                str = this.raw.substring(beg, end)
                out = `${out}${str}[/${tag}]`;
            }

            // Compile new value
            out = this.raw.substring(0, beg) +
                  `${out}` +
                  this.raw.substring(tag == REPEAT_ALIAS ? end : beg);

            this.raw = out;

            // Move cursor
            setTimeout(() => {
                this.$refs.editor.focus();
                this.$refs.editor.setSelectionRange(pos, pos);
            }, 0);
        },

        /**
         * @method onBlockInsert
         * @param {string} tag
         */
        onBlockInsert(tag) {
            this.insertBlock(
                tag,
                this.$refs.editor.selectionStart,
                this.$refs.editor.selectionEnd
            );
        },

        /**
         * @method onInlineInsert
         * @param {string} tag
         */
        onInlineInsert(tag) {
            this.insertInline(
                tag,
                this.$refs.editor.selectionStart,
                this.$refs.editor.selectionEnd
            );
        },

        /**
         * @method onCursorMove
         * @param {Event} event
         */
        onCursorMove(event) {
            this.search();
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
            // No need to go further
            if (!refs) {
                return;
            }

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
