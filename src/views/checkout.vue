<template>
  <div class="checkout">
    <form>
      <input type="text"
             value='first name'/>
      <input type="text"
             value='last name'/>
      <input type="text"
             value='address'/>
      <input type="text"
             value='house number'/>
      <input type="text"
             value='e-mail'/>
    </form>
    <cart />
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import cart from '@/components/cart'
export default {
  name: 'checkout',
  components: {
    cart
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters({
      product: 'productById',
      variation: 'variationById'
    })
  },
  mounted: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.checkout {
  &__item {
    width: 200px;

    img {
      width: 100%;
    }
  }
}
</style>
