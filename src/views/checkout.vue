<template>
  <div class="checkout">
    {{main.order}}
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
export default {
  name: 'checkout',
  data() {
    return {}
  },
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
  methods: {
    ...mapActions(['UPDATE_ORDER'])
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.checkout {
  background: red;
}
</style>
