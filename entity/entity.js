import {
    CHORD_ALIAS,
    SPACER_ALIAS,
    VERSE_TYPE_CODA,
    VERSE_TYPE_INTRO,
    VERSE_TYPE_BRIDGE
} from '../libs/SongChordsParser/SongChordsParser.js';
import SongChordsViewerChart, {
    fixChord
} from '../chart/chart.vue';

/**
 * @const {string} MODULE_ID
 */
const MODULE_ID = 'song-chords-viewer-entity';

export default {

    name: MODULE_ID,

    props: [
        'text',
        'tune',
        'type',
        'alone',
        'value',
        'verse',
        'chords'
    ],

    components: {
        SongChordsViewerChart
    },

    data() {
        return {
            CHORD_ALIAS,
            SPACER_ALIAS,

            bridged: false,
            title: this.value,
            alias: this.value,
            song: null
        };
    },

    created() {
        let title = '';
        let found = null;

        // For some verses types there's no need to show chord's name
        switch (this.verse) {

            case VERSE_TYPE_CODA:
            case VERSE_TYPE_INTRO:
            case VERSE_TYPE_BRIDGE:
                this.bridged = true;
                this.title = '';
                break;

        }

        // Try to parse chord name
        if (!this.bridged && this.type == CHORD_ALIAS) {
            this.title = fixChord(this.title);
        }
    }

};
