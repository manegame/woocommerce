<?php
/*
 * Modifications to WooCommerce for the app. Specifically, add rest endpoint for handling payments.
 *
 */
// Exit if accessed directly
if( !defined( 'ABSPATH' ) ) exit;

if( !class_exists( 'MANEGAME_WooCommerce' ) ) {

    class MANEGAME_WooCommerce {

    	private static $instance;

		public static function instance() {
			if ( self::$instance === null ) {
				self::$instance = new self();
				self::$instance->hooks();
			}

			return self::$instance;
		}

		public function hooks() {

			// Props https://wordpress.org/plugins/wc-rest-payment/
			add_action( 'rest_api_init', array( $this, 'wc_rest_payment_endpoints' ) );
		}

		public function wc_rest_payment_endpoints() {

			/**
			 * Handle Payment Method request.
			 */
			register_rest_route( 'wc/v2', 'manegame-payment', array(
				'methods'  => 'POST',
				'callback' => array( $this, 'wc_rest_payment_endpoint_handler' ),
			) );

		}

		public function wc_rest_payment_endpoint_handler( $request = null ) {

			$response       = array();
			$parameters 	  = $request->get_params();
			$payment_method = sanitize_text_field( $parameters['payment_method'] );
			$order_id       = sanitize_text_field( $parameters['order_id'] );
			$payment_token  = sanitize_text_field( $parameters['payment_token'] );
			$error          = new WP_Error();

			if ( empty( $payment_method ) ) {
				$error->add( 400, __( "Payment Method 'payment_method' is required.", 'wc-rest-payment' ), array( 'status' => 400 ) );
				return $error;
			}
			if ( empty( $order_id ) ) {
				$error->add( 401, __( "Order ID 'order_id' is required.", 'wc-rest-payment' ), array( 'status' => 400 ) );
				return $error;
			} else if ( wc_get_order($order_id) == false ) {
				$error->add( 402, __( "Order ID 'order_id' is invalid. Order does not exist.", 'wc-rest-payment' ), array( 'status' => 400 ) );
				return $error;
			} else if ( wc_get_order($order_id)->get_status() !== 'pending' ) {
				$error->add( 403, __( "Order status is NOT 'pending', meaning order had already received payment. Multiple payment to the same order is not allowed. ", 'wc-rest-payment' ), array( 'status' => 400 ) );
				return $error;
			}
			if ( empty( $payment_token ) ) {
				$error->add( 404, __( "Payment Token 'payment_token' is required.", 'wc-rest-payment' ), array( 'status' => 400 ) );
				return $error;
			}

			if ( $payment_method === "stripe" ) {
				$wc_gateway_stripe                = new WC_Gateway_Stripe();
				$_POST['stripe_token']            = $payment_token;
				$payment_result                   = $wc_gateway_stripe->process_payment( $order_id );

				if ( $payment_result['result'] === "success" ) {
					$response['code']    = 200;
					$response['message'] = __( "Your Payment was Successful", "wc-rest-payment" );

					$order = wc_get_order( $order_id );

					// set order to completed
				    if( $order->get_status() == 'processing' ) {
				        $order->update_status( 'completed' );
				    }

				}

        else {
					return new WP_REST_Response( array("c"), 123 );
					$response['code']    = 401;
					$response['message'] = __( "Please enter valid card details", "wc-rest-payment" );
				}
			}

      // PAYPAL
      else if ( $payment_method === "paypal" ) {
        $wc_gateway_paypal                = new WC_Gateway_Paypal();
        $_POST['paypal_token']            = $payment_token; // does paypal work with a token system????
        $payment_result                   = $wc_gateway_paypal->process_payment( $order_id );

        if ( $payment_result['result'] === "success" ) {
          $response['code']    = 200;
          $response['message'] = __( "Your Payment was Successful", "wc-rest-payment" );

          $order = wc_get_order( $order_id );

          // set order to completed
            if( $order->get_status() == 'processing' ) {
                $order->update_status( 'completed' );
            }
        }

        else {
          return new WP_REST_Response( array("c"), 123 );
          $response['code']    = 401;
          $response['message'] = __( "Please enter valid paypal details", "wc-rest-payment" );
        }

      }

      else {
				$response['code'] = 405;
				$response['message'] = __( "Please select an available payment method. Supported payment method can be found at https://wordpress.org/plugins/wc-rest-payment/#description", "wc-rest-payment" );
			}

			return new WP_REST_Response( $response, 123 );
		}

	}

	$MANEGAME_WooCommerce = new MANEGAME_WooCommerce();
    $MANEGAME_WooCommerce->instance();

} // End if class_exists check
