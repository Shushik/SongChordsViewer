import {
    CHORD_ALIAS,
    SPACER_ALIAS
} from '../libs/SongChordsParser/SongChordsParser.js';

const MODULE_ID = 'song-chords-viewer-line';

export default {

    name: MODULE_ID,

    props: [
        'text',
        'type',
        'alone',
        'value'
    ],

    data() {
        return {
            CHORD_ALIAS,
            SPACER_ALIAS,

            song: null
        };
    },

};
