<?php
/**
 * Plugin Name:     MANEGAME Woocommerce add Image Sizes
 * Plugin URI:      http://manusnijhoff.nl
 * Description:     Add Image Sizes to Woocommerce, register them in REST endpoints
 * Version:         0.1.1
 * Author:          Manus Nijhoff
 * Author URI:      http://manusnijhoff.nl
 *
 * @author          Manus Nijhoff
 * @copyright       Copyright (c) Manus Nijhoff 2018
 *
 */

/**
 * Check if WooCommerce is active
 **/

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}

$post_types = get_post_types();

if ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {
    // Put your plugin code here
    add_action( 'admin_notices', 'manegame_notice');

    // $args = array(
    //   'public'   => false,
    //   '_builtin' => false
    // );

    $post_types = get_post_types( '', 'names', 'and' );

    foreach ( $post_types as $post_type ) {
      echo_log($post_type);
   }   
}

function manegame_notice() {
  ?>
  <div class="notice is-dismissable">
      <p>Plugin initiated</p>
  </div>
  <?php
}

/* Echo variable
 * Description: Uses <pre> and print_r to display a variable in formated fashion
 */
function echo_log( $what )
{
    echo '<pre>                  '.print_r( $what, true ).'</pre>';
}

?>