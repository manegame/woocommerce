<template>
  <div class="product">
    <template v-if='main.singleProduct.product !== ""'>
      <!-- VARIABLE PRODUCTS -->
      <template v-if='variableProduct && selected !== ""'>
        <mg :source='variation(selected).image.src' />
        <p>€{{variation(selected).price}}</p>
      </template>
      <!-- SIMPLE PRODUCTS -->
      <template v-else>
        <mg :source='main.singleProduct.product.images[0].src' />
        <p>€{{main.singleProduct.product.price}}</p>
      </template>
      <!-- DESCRIPTION ETC. -->
      <p v-html='main.singleProduct.product.short_description'/>
      <!-- VARIABLES -->
      <div v-if='main.singleProduct.product.attributes.length > 0'>
        <div v-for='attribute in main.singleProduct.product.attributes'
             :key='attribute.id'>
          <form v-if='attribute.name !== ""'>
            <select v-model='selected'>
              <option disabled value=''>MAKE YOUR CHOICE</option>
              <option v-for='option in attribute.options'
                      :key='option.id'
                      :value='option'
                      v-html='option'/>
            </select>
          </form>
        </div>
      </div>
      <!-- BUY -->
      <button type='submit'
              value='buy'
              @click.prevent='addToCart'>Add to Cart</button>
      {{msg}}
       <cart />
    </template>
  </div>
</template>

<script>
import {mapState, mapGetters, mapActions} from 'vuex'
import mg from '@/components/base/mg'
import cart from '@/components/cart'

export default {
  name: 'product',
  components: { mg, cart },
  data() {
    return {
      selected: '',
      msg: ''
    }
  },
  mounted() {},
  updated: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters({
      variation: 'productVariationByOption'
    }),
    variableProduct() {
      if (this.main.singleProduct.variations.length > 0) return true
      else return false
    }
  },
  methods: {
    ...mapActions(['ADD_TO_CART']),
    addToCart() {
      if (this.variableProduct === true) {
        if (this.selected === '') {
          this.msg = 'first select an option'
        } else {
          this.ADD_TO_CART({
            product: this.main.singleProduct.product,
            variation: this.variation(this.selected)
          })
        }
      } else {
        this.ADD_TO_CART({ product: this.main.singleProduct.product })
      }
    }
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.product {
  width: 200px;

  img {
    width: 100%;
    height: auto;
  }
}
</style>
