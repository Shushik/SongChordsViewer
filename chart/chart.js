import ChordView from '../libs/ChordView/ChordView.js';
import SongChordsParser, {
    FLAT_REXP,
    FLAT_SYMBOL,
    BEKAR_SYMBOL,
    SHARP_REXP,
    SHARP_SYMBOL
} from '../libs/SongChordsParser/SongChordsParser.js';

/**
 * @const {string} MODULE_ID
 */
const MODULE_ID = 'song-chords-viewer-chart';

/**
 * @const {string} CHORD_INSERTION_SIGN
 */
const CHORD_INSERTION_SIGN = '{';

/**
 * @const {RegExp} CHORD_TITLE_REST_REXP
 */
const CHORD_TITLE_REST_REXP = /(_\S+)$/;

/**
 * @function fixChord
 * @param {string} raw
 * @returns {string}
 */
export function fixChord(alias, full = false) {
    // No need to go further
    if (!alias || alias[0] == CHORD_INSERTION_SIGN) {
        return '';
    }

    if (full === false) {
        alias = alias.replace(CHORD_TITLE_REST_REXP, '');
    }

    return `${alias}`.
           replace(SHARP_REXP, `$1${SHARP_SYMBOL}`).
           replace(FLAT_REXP, `$1${FLAT_SYMBOL}`);
}

/**
 * @function onEditorInput
 * @param {string} alias
 * @param {Array<string>} tune
 * @param {object} chords
 * @param {boolean} titled
 * @param {boolean} full
 * @returns {object}
 */
export function parseChord(alias, tune, chords, titled = true, full = false) {
    let title = '';
    let chord = null;

    if (alias[0] == CHORD_INSERTION_SIGN) {
        try {
            chord = JSON.parse(alias);
            chord.tune = tune;

            alias = chord.title;
        } catch(e) {}
    } else if (chords[alias]) {
        title = titled ? fixChord(alias, full) : '';

        chord = {
            tune: tune,
            chord: chords[alias],
            title
        };
    }

/*
    if (chord && chord.title) {
        chord.title = !full && chord.title ?
                      chord.title.replace(CHORD_TITLE_REST_REXP, '') :
                      chord.title;
    }
*/

    return chord;
}

export default {

    name: MODULE_ID,

    props: [
        'full',
        'tune',
        'alias',
        'chords',
        'titled'
    ],

    data() {
        return {
            chord: parseChord(
                       this.alias,
                       this.tune,
                       this.chords,
                       this.titled === undefined ? true : this.titled,
                       this.full === undefined ? false : this.full
                   )
        };
    },

    mounted() {
        // No need to go further
        if (!this.chord) {
            /**
             * @todo Make no chord found view
             */
            return;
        }

        const root = this.$refs.chart;
        const {tune, chord, title} = this.chord;

        new ChordView({
            root,
            tune,
            chord,
            title
        });

    }

};
