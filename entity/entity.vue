<template>
    <span
        v-if="type == CHORD_ALIAS"
        class="song__chord"
        :ref="bridged ? value : null"
        :class="{
            'song__chord_is_alone': alone
        }"
        :data-alias="!bridged ? alias : null"
    >
        {{ !bridged && title ? title : null }}
    </span>
    <span
        v-else-if="!bridged && type == SPACER_ALIAS"
        class="song__space"
        :style="{
            width: value * 0.5 + 'em'
        }"
    ></span>
    <span v-else>
        {{ !bridged ? text : null }}
    </span>
</template>
<script src="./entity.js"></script>
