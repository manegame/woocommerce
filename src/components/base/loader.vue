<template>
  <div class="loader">
    <p v-if='seconds > 5'>{{msg}}</p>
    <template v-if='seconds > 10'>
      <a v-for='(link, index) in funLinks'
          :key='"funlink-"+index'
         :href='link'>{{link}} </a>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'loader',
    data() {
      return {
        msg: '',
        seconds: 0,
        funLinks: ['ebay.com', 'http://pornhub.com', 'http://pipashop.nl']
      }
    },
    props: {
      element: {
        type: String,
        required: false
      }
    },
    mounted() {
      window.setInterval(() => { this.seconds++ }, 1000)
    },
    watch: {
      seconds(val) {
        if (val < 10 && this.element) this.msg = 'Loading ' + this.element
        else if (val >= 10) this.msg = 'Check out these fun links while waiting'
      }
    }
  }
</script>

<style>
  .loader {
    width: 200px;
    text-align: center;
  }

  .loader:after {
    overflow: hidden;
    display: block;
    margin: 0 auto;
    -webkit-animation: ellipsis steps(4,end) 900ms infinite;
    animation: ellipsis steps(4,end) 900ms infinite;
    content: "\2026";
    width: 0px;
  } 

  @keyframes ellipsis {
    to {
      width: 1.25em;
    }
  }

  @-webkit-keyframes ellipsis {
    to {
      width: 1.25em;
    }
  }
 
</style>
