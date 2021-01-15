<template>
  <v-list-item link @click.stop="openDialog">
    <v-list-item-icon>
      <v-icon>{{ icon }}</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>{{ title }}</v-list-item-title>
      <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: "DialogOpener",
  props: ['icon', 'title', 'subtitle'],
  data () {
    return {
      content: this.value
    }
  },
  methods: {
    openDialog () {
      this.$emit('input', true);
      this.$emit('dialog-opened', true);
      
    }
  }
}
</script>