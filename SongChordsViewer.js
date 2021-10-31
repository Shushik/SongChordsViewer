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
    REPEAT_SHORTCUT,
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
import SongChordsViewerEntity from './entity/entity.vue';
import SongChordsViewerChart, {
    fixChord,
    isInsertion
} from './chart/chart.vue';

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

/**
 * @const {string} CHORD_CANVAS_CLASS
 */
const CHORD_CANVAS_CLASS = 'song__chart';

/**
 * @const {string} CHORD_CANVAS_HIGHLIGHTED_CLASS
 */
const CHORD_CANVAS_HIGHLIGHTED_CLASS = 'song__chart_is_highlighted';

/**
 * @const {string} CHORD_ELEMENT_CLASS
 */
const CHORD_ELEMENT_CLASS = 'song__chord';

/**
 * @const {string} CHORDS_ELEMENT_CLASS
 */
const CHORDS_ELEMENT_CLASS = 'song__chords';

/**
 * @const {RegExp} CHORD_OPEN_REXP
 */
const CHORD_OPEN_REXP = /(\[c(hord)?="([^"]*))$/;

/**
 * @const {RegExp} CHORD_CLOSE_REXP
 */
const CHORD_CLOSE_REXP = /^([^"]+)"+\]?/;

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
    [REPEAT_ALIAS]: 0,
    [REPEAT_SHORTCUT]: REPEAT_DEFAULT_VALUE,
    [SPACER_ALIAS]: 0,
    [SPACER_SHORTCUT]: SPACER_DEFAULT_VALUE
};

/**
 * @const {Array<string>} DEFAULT_TUNE
 */
const DEFAULT_TUNE = ['E', 'B', 'G', 'D', 'A', 'E'];

/**
 * @const {Array<string>} DEFAULT_COLORS
 */
const DEFAULT_COLORS = [
    '198172201',
    '236180191',
    '253214181',
    '253243184',
    '167228174',
    '191255230',
    '134153209',
    '219169206',
    '170231232',
    '239230235',
    '071209213',
    '232210255',
    '193209253',
    '217224252',
    '255224241'
];

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
        'editor',
        'colors'
    ],

    emits: [
        SONG_VIEWER_EVENT_PARSED,
        SONG_VIEWER_EVENT_CLEARED
    ],

    components: {
        SongChordsViewerChart,
        SongChordsViewerEntity
    },

    i18n: {messages},

    data() {
        return {
            CHORD_ALIAS,
            REPEAT_ALIAS,
            REPEAT_SHORTCUT,
            SPACER_ALIAS,
            VERSE_TYPE_NOTE,
            VERSE_TYPE_CHORUS,
            VERSE_TYPE_DEFAULT,
            VERSE_TYPE_ASTERISM,
            VERSE_TYPE_EPIGRAPH,
            AUTHOR_TYPE_DEFAULT,
            SONG_VIEWER_EVENT_CLEAR,
            SONG_VIEWER_EVENT_PARSE,

            BLOCKS_LIST,
            INLINES_LIST,
            INLINES_VALUES,

            revision: 0,
            suggested: 0,
            raw: '',
            song: null,
            usedChords: null,
            suggestedChords: null
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

    computed: {
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

            // 
            this.usedChords = null;

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
            let colors = this.colors instanceof Array ?
                         this.colors :
                         DEFAULT_COLORS;

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
                tune,
                title: this.raw ? title : '',
                chords,
                colors: {loop: 0, list: colors},
                verses,
                authors: authorsGroupedByType
            };

            // Draw chords
            if (chords && chords.length && root && this.chords) {
                this.usedChords = chords;
            } else {
                this.usedChords = null;
            }

            this.$emit(SONG_VIEWER_EVENT_PARSED, {
                title,
                chords,
                verses,
                authors: authorsGroupedByType
            });
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
            beg = val.substring(0, pos).match(CHORD_OPEN_REXP);

            // If [c="... found
            if (beg) {
                seek = beg[3];

                // Try to find ..."]
                if (val.length - 1 > pos) {
                    end = val.substring(pos).match(CHORD_CLOSE_REXP);
                }

                // If ..."] found
                if (end) {
                    seek += end[1];
                }
            }

            // Clean previous results
            this.suggestedChords = null;

            // Search
            if (isInsertion(seek)) {
                seek = seek.replace(
                           /(\d|barre|active|inactive|open|mute)(:)/g,
                           '"$1"$2'
                       );
                seek = `{"title":"","chord":${seek}}`;
                found = [{active: false, alias: seek}];
            } else if (seek) {
                // Compile search string
                seek = fixChord(seek);

                stack = Object.getOwnPropertyNames(this.chords);
                found = [];

                // Iterate through chords object
                for (ln0 = stack.length; it0 < ln0; it0++) {
                    if (stack[it0].indexOf(seek) === 0) {
                        found.push({active: true, alias: stack[it0]});
                    }
                }
            }

            if (found.length) {
                // Order chords list
                found.sort(orderChords);

                this.suggestedChords = found.length ? found : null;

                this.$emit(SONG_VIEWER_EVENT_SEARCHED, {seek, found});
            }
        },

        /**
         * @method getAsJSON
         * @returns {string}
         */
        getAsJSON() {
            return api.json;
        },

        /**
         * @method getAsObject
         * @returns {object}
         */
        getAsObject() {
            return api.parsed;
        },

        /**
         * @method insertChord
         * @param {string} alias
         */
        insertChord(alias) {
            let pos = this.$refs.editor.selectionStart;
            let val = this.raw;
            let out = '';
            let str = '';
            let beg = null;
            let end = null;

            // Try to find [c="...
            beg = val.substring(0, pos).match(CHORD_OPEN_REXP);

            // If [c="... found
            if (beg) {
                str = beg[3];

                // Try to find ..."]
                if (val.length - 1 > pos) {
                    end = val.substring(pos).match(CHORD_CLOSE_REXP);
                }

                pos -= str.length;

                // If ..."] found
                if (end) {
                    str += end[1];
                }
            }

            // Compile new value
            out = val.substring(0, pos) +
                  `${alias}` +
                  val.substring(pos + str.length);

            this.raw = out;

            pos += alias.length;

            // Move cursor
            setTimeout(() => {
                this.$refs.editor.focus();
                this.$refs.editor.setSelectionRange(pos, pos);
            }, 0);
        },

        /**
         * @method highlightChord
         * @param {string} alias
         */
/*
        highlightChord(alias) {
            // No need to go further
            if (!alias) {
                return;
            }

            let loop = 0;
            let b = '';
            let g = '';
            let r = '';
            let seek = `.${CHORDS_ELEMENT_CLASS} .${CHORD_CANVAS_CLASS}[data-alias="${alias}"]`;
            let color = '';
            let node = this.$refs.chords.
                       querySelector(seek);

            // No need to go further
            if (!node) {
                return;
            }

            if (node.classList.contains(CHORD_CANVAS_HIGHLIGHTED_CLASS)) {
                node.classList.remove(CHORD_CANVAS_HIGHLIGHTED_CLASS);
                node.style.backgroundImage = '';
            } else {
                loop = this.song.colors.loop;
                color = this.song.colors.list[loop];
                b = color.substring(6);
                g = color.substring(3, 5);
                r = color.substring(0, 2);

                node.classList.add(CHORD_CANVAS_HIGHLIGHTED_CLASS);
//                 node.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
                node.style.backgroundImage = `linear-gradient(-90deg, rgba(255, 255, 255, 0), rgba(${r}, ${g}, ${b}, 0.4) 100%, rgba(255, 255, 255, 0))`;

                loop++;

                this.song.colors.loop = loop == this.song.colors.list.length ?
                                        0 :
                                        loop;
            }
        },
*/

        /**
         * @method insertBlock
         * @param {string} tag
         */
        insertBlock(tag) {
            let beg = this.$refs.editor.selectionStart;
            let end = this.$refs.editor.selectionEnd;
            let pos = beg + `[${tag}]`.length;
            let val = this.raw;
            let str = val.substring(beg, end);
            let out = `[${tag}]${str}[/${tag}]`;

            // Compile new value
            out = val.substring(0, beg) +
                  `${out}` +
                  val.substring(end);

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
         */
        insertInline(tag) {
            let beg = this.$refs.editor.selectionStart;
            let end = this.$refs.editor.selectionEnd;
            let pos = beg + `[${tag}="`.length;
            let str = '';
            let out = `[${tag}=""]`;
            let val = this.raw;

            // Add endint tag for [repeat]
            if (tag == REPEAT_ALIAS || tag == REPEAT_SHORTCUT) {
                str = val.substring(beg, end)
                out = `${out}${str}[/${tag}]`;
            }

            // Compile new value
            out = val.substring(0, beg) +
                  `${out}` +
                  val.substring(tag == REPEAT_ALIAS ? end : beg);

            this.raw = out;

            // Move cursor
            setTimeout(() => {
                this.$refs.editor.focus();
                this.$refs.editor.setSelectionRange(pos, pos);
            }, 0);
        },

        /**
         * @method hideSuggest
         */
        hideSuggest() {
            if (this.suggested) {
                this.suggested = 0;
            }
        },

        /**
         * @method onBlockInsert
         * @param {string} tag
         */
        onBlockInsert(tag) {
            this.insertBlock(tag);
        },

        /**
         * @method onInlineInsert
         * @param {string} tag
         */
        onInlineInsert(tag) {
            this.insertInline(tag);
        },

        /**
         * @method onChordClick
         * @param {Event} event
         */
        onChordClick(event) {
            let alias = '';
            let node = event.target;

            if (node && node.classList.contains(CHORD_ELEMENT_CLASS)) {
                this.highlightChord(node.getAttribute('data-alias'));
            }
        },

        /**
         * @method onEscPressed
         * @param {Event} event
         */
        onEscPressed(event) {
            this.hideSuggest();
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

        onSuggestedChordClicked(alias) {
            this.insertChord(alias);
        },

        [SONG_VIEWER_EVENT_CLEAR]() {
            this.clear()
        },

        [SONG_VIEWER_EVENT_PARSE](raw) {
            this.parse(raw);
        }

    }

}
