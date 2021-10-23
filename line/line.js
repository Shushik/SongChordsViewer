import {
    CHORD_ALIAS,
    SPACER_ALIAS
} from '../libs/SongChordsParser/SongChordsParser.js';

/**
 * @const {string} MODULE_ID
 */
const MODULE_ID = 'song-chords-viewer-line';

/**
 * @const {string} SONG_VIEWER_EVENT_CHORD_FOUND
 */
export const SONG_VIEWER_EVENT_CHORD_FOUND = `${MODULE_ID}-chord-found`;

export default {

    name: MODULE_ID,

    props: [
        'text',
        'type',
        'alone',
        'value',
        'bridged'
    ],

    data() {
        return {
            CHORD_ALIAS,
            SPACER_ALIAS,

            song: null
        };
    },

    mounted() {
        setTimeout(() => {
            this.$emit(SONG_VIEWER_EVENT_CHORD_FOUND, this.$refs);
        }, 0);
    }

};
