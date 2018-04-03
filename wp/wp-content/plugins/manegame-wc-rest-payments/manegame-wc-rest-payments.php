<?php
/**
 * Plugin Name:     MANEGAME Woocommerce Mod
 * Plugin URI:      http://manusnijhoff.nl
 * Description:     Register Paypal and Stripe payment gateways for Woocommerce REST API.
 * Version:         0.1.1
 * Author:          Scott Bolinger (Modif. Manus Nijhoff)
 * Author URI:      http://manusnijhoff.nl
 *
 * @author          Scott Bolinger (Modif. Manus Nijhoff)
 * @copyright       Copyright (c) Manus Nijhoff 2018
 *
 */


// Exit if accessed directly
if( !defined( 'ABSPATH' ) ) exit;

if( !class_exists( 'MANEGAME_Payment_Integration' ) ) {

    class MANEGAME_Payment_Integration {

    	private static $instance;

		public static function instance() {
			if ( self::$instance === null ) {
				self::$instance = new self();
				self::$instance->includes();
			}

			return self::$instance;
		}

		/**
         * Include necessary files
         *
         * @access      private
         * @since       0.1.0
         * @return      void
         */
        private function includes() {

            require_once plugin_dir_path( __FILE__ ) . 'inc/class-manegame-woocommerce.php';

        }

	}
} // End if class_exists check


/**
 * The main function responsible for returning the instance
 *
 * @since       0.1.0
 * @return      MANEGAME_Payment_Integration::instance()
 *
 */
function manegame_app_integration_load() {
    return MANEGAME_Payment_Integration::instance();
}
add_action( 'plugins_loaded', 'manegame_app_integration_load' );
