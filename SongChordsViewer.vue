<template>
    <div
        class="song"
        :class="{
            'song_mode_editor': editor
        }"
    >
        <div
            v-if="editor"
            class="song__editor"
        >
            <div class="song__editor-help">
                <div
                    v-show="song && suggestedChords"
                    class="song__suggest"
                >
                    <song-chords-viewer-chart
                        v-for="chord in suggestedChords"
                        :key="'song-chords-viewer-chart-' + revision + chord"
                        :full="true"
                        :tune="song.tune"
                        :alias="chord"
                        :chords="chords"
                        @click="onSuggestedChordClicked(chord)"
                    />
                </div>
                <div class="song__editor-tags">
                    <span
                        v-for="tag in BLOCKS_LIST"
                        class="song__editor-tag"
                        @click="onBlockInsert(tag)"
                    >[{{ tag }}]</span>
                </div>
                <div class="song__editor-tags">
                    <span
                        v-for="tag in INLINES_LIST"
                        class="song__editor-tag"
                        @click="onInlineInsert(tag)"
                    >
                        [{{ tag }}<template v-if="INLINES_VALUES[tag]">="{{ INLINES_VALUES[tag] }}"</template>]
                    </span>
                </div>
            </div>
            <div class="song__editor-input">
                <textarea
                    v-model.trim="raw"
                    ref="editor"
                    class="song__textarea"
                    :placeholder="$t('editor.placeholder')"
                    @click="onCursorMove"
                    @focus="onCursorMove"
                    @keyup.esc="onEscPressed"
                    @keyup.up="onCursorMove"
                    @keyup.right="onCursorMove"
                    @keyup.down="onCursorMove"
                    @keyup.left="onCursorMove"
                ></textarea>
            </div>
        </div>
        <div class="song__lyrics">
            <div
                v-if="song"
                class="song__title"
            >{{ song.title }}</div>
            <div
                v-if="song"
                class="song__copyright"
            >
                <template v-for="group in song.authors">
                    <div
                        v-if="group.list.length"
                        class="song__authors"
                        :class="{
                            ['song__authors_of_' + group.type]: group.type != AUTHOR_TYPE_DEFAULT
                        }"
                    >
                        <span class="song__label">{{ $t('author.' + group.type) }}</span>
                        <span
                            v-for="author, pos in group.list"
                            class="song__author"
                        >{{ author }}</span>
                    </div>
                </template>
            </div>
            <template v-if="song">
                <div
                    v-for="verse in song.verses"
                    class="song__verse"
                    :class="{
                        ['song__verse_type_' + verse.type]: verse.type != VERSE_TYPE_DEFAULT
                    }"
                >
                    <div
                        v-if="verse.type != VERSE_TYPE_DEFAULT && verse.type != VERSE_TYPE_ASTERISM"
                        class="song__label"
                    >{{ $t('verse.' + verse.type) }}</div>
                    <template v-for="line in verse.lines">
                        <div
                            v-if="line.type == REPEAT_ALIAS"
                            class="song__repeat"
                            :class="{
                                'song__repeat_is_chorded': line.chorded
                            }"
                        >
                            <div class="song__label">
                                {{ $t('repeat.label') }} {{ $tc('repeat.times', line.times) }}
                            </div>
                            <template
                                v-for="subline in line.lines"
                                :key="'song-chords-viewer-entity-' + revision"
                            >
                                <template v-for="slice in subline">
                                    <song-chords-viewer-entity
                                        :text="!slice.type ? slice : null"
                                        :tune="song.tune"
                                        :type="slice.type ? slice.type : null"
                                        :alone="slice.alone ? slice.alone : null"
                                        :chords="chords"
                                        :value="slice.value ? slice.value : null"
                                        :verse="verse.type"
                                        @click="!editor ? onChordClick : null"
                                    />
                                </template><br/>
                            </template>
                        </div>
                        <template v-else>
                            <template
                                v-for="slice in line"
                                :key="'song-chords-viewer-entity-' + revision"
                            >
                                <song-chords-viewer-entity
                                    :text="!slice.type ? slice : null"
                                    :tune="song.tune"
                                    :type="slice.type ? slice.type : null"
                                    :alone="slice.alone ? slice.alone : null"
                                    :chords="chords"
                                    :value="slice.value ? slice.value : null"
                                    :verse="verse.type"
                                    @click="!editor ? onChordClick : null"
                                />
                            </template><br/>
                        </template>
                    </template>
                </div>
            </template>
        </div>
        <div
            ref="chords"
            class="song__chords"
        >
            <template v-if="song && usedChords">
                <song-chords-viewer-chart
                    v-for="chord in usedChords"
                    :key="'song-chords-viewer-chart-' + revision"
                    :tune="song.tune"
                    :alias="chord"
                    :chords="chords"
                />
            </template>
        </div>
    </div>
</template>
<script src="./SongChordsViewer.js"></script>
<style src="./SongChordsViewer.less"></style>
