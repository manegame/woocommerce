<template>
  <div class="product">
    <template v-if='main.singleProduct !== ""'>
      <img :src='main.singleProduct.images[0].src' />
    </template>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  name: 'product',
  computed: {
    ...mapState(['main'])
  },
  mounted() {},
  updated: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  methods: {}
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.product {
  color: blue;
}
</style>
