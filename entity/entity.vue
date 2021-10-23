<template>
    <span
        v-if="type == CHORD_ALIAS"
        class="song__chord"
        :ref="bridged ? value : null"
        :class="{
            'song__chord_is_alone': alone
        }"
    >
        {{ !bridged ? value : null }}
    </span>
    <span
        v-else-if="!bridged && type == SPACER_ALIAS"
        class="song__space"
        :style="{
            width: value * 5 + 'px'
        }"
    ></span>
    <span v-else>
        {{ !bridged ? text : null }}
    </span>
</template>
<script src="./entity.js"></script>
