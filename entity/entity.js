import {
    CHORD_ALIAS,
    SPACER_ALIAS,
    VERSE_TYPE_CODA,
    VERSE_TYPE_INTRO,
    VERSE_TYPE_BRIDGE
} from '../libs/SongChordsParser/SongChordsParser.js';

/**
 * @const {string} MODULE_ID
 */
const MODULE_ID = 'song-chords-viewer-entity';

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
        'verse'
//         'bridged'
    ],

    data() {
        return {
            CHORD_ALIAS,
            SPACER_ALIAS,

            titled: true,
            bridged: false,
            song: null
        };
    },

    created() {
        switch (this.verse) {

            case VERSE_TYPE_CODA:
            case VERSE_TYPE_INTRO:
            case VERSE_TYPE_BRIDGE:
                this.bridged = false;
                break;

        }

        if (this.value && this.value[0] == '{') {
            this.titled = false;
        }
    },

    mounted() {
        if (this.bridged) {
            setTimeout(() => {
                this.$emit(SONG_VIEWER_EVENT_CHORD_FOUND, this.$refs);
            }, 0);
        }
    }

};
