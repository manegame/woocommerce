<template>
  <div class="cart">
    Shoppin cart
    <ul>
      <li v-for='item in main.cart'
          :key='item.data.id'>
        <!-- PRICE -->
        <template v-if='item.data.variation'>
          {{item.data.product.name}}<span>({{item.data.variation.attributes[0].option}})</span>
          <span>€{{item.data.variation.price}}</span>
        </template>
        <template v-else>
          <span>€{{item.data.product.price}}</span>
        </template><span>amount: {{item.quantity}}</span>
        <span @click='addOne(item)'>+</span>
        <span @click='removeOne(item)'>-</span>
      </li>
    </ul>
    <p>
      Total: {{cartTotal}}<br />
    </p>
    <p>
      Shipping:
    </p>
    <router-link v-if='$route.name !== "checkout"'
                 tag='button'
                 :to="{ name: 'checkout' }">Checkout</router-link>
  </div>
</template>

<script>
import {mapState, mapGetters, mapActions} from 'vuex'
export default {
  name: 'cart',
  data() {
    return {}
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters(['cartTotal'])
  },
  mounted: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  methods: {
    ...mapActions(['ADD_TO_CART']),
    addOne(item) {
      this.ADD_TO_CART(item.data)
    }
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.cart {
  background: rgb(199, 199, 199);
  width: 400px;
}
</style>
