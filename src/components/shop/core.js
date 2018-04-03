import {mapState, mapActions} from 'vuex'

export default {
  computed: {
    ...mapState(['shop'])
  },
  watch: {
    $route(to, from) {
      this.$_fetchData(to)
      if (from.name === 'order-complete') this.EMPTY_ORDER()
    }
  },
  mounted() {
    this.$_setMetaTags()
  },
  methods: {
    ...mapActions([
      'GET_PRODUCTS',
      'GET_PRODUCT_VARIATIONS',
      'GET_PRODUCT_CATEGORIES',
      'GET_SHIPPING_ZONES',
      'GET_SHIPPING_ZONE_LOCATIONS',
      'GET_SHIPPING_ZONE_METHODS',
      'GET_PRODUCT',
      'SHIPPING_LOADED',
      'EMPTY_ORDER'
    ]),
    $_fetchData(route) {
      // All requests for data from the server originates from this function
      switch (route.name) {
        case 'mainView':
          this.GET_PRODUCTS()
          this.GET_PRODUCT_CATEGORIES()
          break
        case 'product':
          this.GET_PRODUCT(route.params.slug).then(() => {
            this.GET_PRODUCT_VARIATIONS(this.shop.singleProduct.product.id)
          })
          break
        case 'checkout':
          this.GET_PRODUCTS()
          this.GET_SHIPPING_ZONES()
            .then(() => {
              let promises = []
              this.shop.shipping_zones.forEach((zone) => {
                promises.push(this.GET_SHIPPING_ZONE_LOCATIONS(zone.id))
                promises.push(this.GET_SHIPPING_ZONE_METHODS(zone.id))
              })
              return Promise.all(promises)
            }).then(this.SHIPPING_LOADED)
          break
      }
    }
  }
}
