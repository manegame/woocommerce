<template>
  <div class="progressive">
    
    <img class='preview' v-progressive='source' src="http://placehold.it/1x1"/>
  </div>
</template>

<script>
import loader from '@/components/base/loader'
export default {
  name: 'mg',
  components: { loader },
  props: {
    source: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      mounted: false,
      initial: 'https://placehold.it/1x1'
    }
  },
  mounted() {
    this.$el.src = this.source
  }
}
</script>

<style>
  /* nothing */
</style>
