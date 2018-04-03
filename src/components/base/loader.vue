<template>
  <div class="loader">
    <p v-if='element'>Loading {{element}}</p>
  </div>
</template>

<script>
  export default {
    name: 'loader',
    props: {
      element: {
        type: String,
        required: false
      }
    }
  }
</script>

<style>
  .loader {
    text-align: center;
  }

  .loader:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: middle;
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
