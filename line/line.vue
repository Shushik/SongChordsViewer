<template>
    <span
        v-if="type == CHORD_ALIAS"
        class="song__chord"
        :class="{
            'song__chord_is_alone': alone
        }"
    >{{ value }}</span>
    <span
        v-else-if="type == SPACER_ALIAS"
        class="song__space"
        :style="{
            width: value * 5 + 'px'
        }"
    ></span>
    <span v-else>
        {{ text }}
    </span>
</template>
<script src="./line.js"></script>
