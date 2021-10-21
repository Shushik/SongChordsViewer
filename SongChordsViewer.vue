<template>
    <div class="song">
        <div class="song__lyrics">
            <h2
                v-if="song"
                class="song__title"
            >{{ song.title }}</h2>
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
                        <span class="song__label">{{ group.type }}:</span>
                        <span
                            v-for="author in group.list"
                            class="song__author"
                        >{{ author }}</span>
                    </div>
                </template>
            </div>
            <p
                v-for="verse in song.verses"
                class="song__verse"
                style="margin-top: 1em;"
                :class="{
                    ['song__verse_type_' + verse.type]: verse.type != VERSE_TYPE_DEFAULT
                }"
            >
                <template v-for="line in verse.lines">
                    <div
                        v-if="line.type == 'repeat'"
                        class="song__repeat"
                    >
                        <span class="song__label">repeat {{ line.times }}:</span><br/>
                        <template v-for="subline in line.lines">
                            <template v-for="slice in subline">
                                <song-chords-viewer-line
                                    :text="!slice.type ? slice : null"
                                    :type="slice.type ? slice.type : null"
                                    :alone="slice.alone ? slice.alone : null"
                                    :value="slice.value ? slice.value : null"
                                />
                            </template><br/>
                        </template>
                    </div>
                    <template v-else>
                        <template v-for="slice in line">
                            <song-chords-viewer-line
                                :text="!slice.type ? slice : null"
                                :type="slice.type ? slice.type : null"
                                :alone="slice.alone ? slice.alone : null"
                                :value="slice.value ? slice.value : null"
                            />
                        </template><br/>
                    </template>
                </template>
            </p>
        </div>
        <div
            ref="chords"
            class="song__chords"
        ></div>
    </div>
</template>
<script src="./SongChordsViewer.js"></script>
<style src="./SongChordsViewer.less"></style>
