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
    ],

    emits: [
        SONG_VIEWER_EVENT_CHORD_FOUND
    ],

    data() {
        return {
            CHORD_ALIAS,
            SPACER_ALIAS,

            bridged: false,
            title: this.value,
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
        if (
            !this.bridged &&
            this.type == CHORD_ALIAS &&
            this.value &&
            this.value[0] == '{'
        ) {
            found = this.value.match(/\{"title":"([^"]+)"/);

            if (found && found[1]) {
                this.title = found[1];
            } else {
                this.title = '';
            }
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
