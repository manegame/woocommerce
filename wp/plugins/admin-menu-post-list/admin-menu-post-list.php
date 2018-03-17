<?php
/*
Plugin Name: Admin Menu Post List
Plugin URI: http://wordpress.org/plugins/admin-menu-post-list/
Description: Display a post list in the admin menu
Version: 2.0.1
Author: Eliot Akira
Author URI: eliotakira.com
License: GPL2
*/


class AdminMenuPostList {

	private $current_indent_level;
	private $max_trim_length;

	private $drop_down_enabled;
	private $current_drop_down_count;

	private $current_list_count;
	private $max_list_count;

	private $saved_notice;

	function __construct() {

		// Admin frontend
		add_action( 'admin_menu', array($this,'add_post_list_view'), 11 );
		add_action( 'admin_head', array($this,'post_list_css'));
		add_action( 'admin_footer', array($this,'admin_footer_scripts') );

		// Admin backend
		add_action( 'admin_init', array($this,'register_settings') );
		add_action( 'admin_menu', array($this,'create_menu') );
		add_filter( 'plugin_action_links', array($this,'plugin_settings_link'), 10, 4 );
		// Remove "Settings saved" message on admin page
		add_action( 'admin_notices', array($this, 'remove_settings_saved_notice') );
		$this->saved_notice = false;
	}
	

/*========================================================================
 *
 * Admin frontend
 *
 *=======================================================================*/


	/*========================================================================
	 *
	 * Build each item
	 *
	 *=======================================================================*/

	function build_post_list_item($post_id, $post_type, $is_child, $child_query) {

		if( !isset($_GET['post']) )
			$current_post_ID = -1;
		else
			$current_post_ID = $_GET['post']; /* Get current post ID on admin screen */

		$edit_link = get_edit_post_link($post_id);
		$title = get_the_title($post_id);
		$title = esc_html($title);

	 	// Limit title length

	 	if (($this->max_trim_length>0) && ( strlen($title)>($this->max_trim_length) ) ) {
	 		$orig_title = $title;
			if( function_exists( 'mb_substr' ) ) {
				$title = mb_substr($title, 0, $this->max_trim_length);
			} else {
				$title = substr($title, 0, $this->max_trim_length);
			}
			if ($title != $orig_title) $title.='..';
		}

		if (rtrim($title) == '') $title = '(no title)';


		$output = '<div class="';

		if ($is_child != 'child') {
			$output .= 'post_list_view_indent';
		} else {
			$output .= 'post_list_view_child';
		}

		if ($current_post_ID == ($post_id)) { $output .= ' post_current'; }

		$output .= '">';

		$output .= '<a href="' . $edit_link . '">';


		/*========================================================================
		 *
		 * Indent child posts
		 *
		 *=======================================================================*/

		if ($is_child == 'child') {
			if ($this->current_indent_level>0) {
				$output .= '<div class="ampl-child-dash">';
				for ($i=0; $i < $this->current_indent_level; $i++) { 
					$output .= '&ndash;';
				}
				$output .= '</div>';
				$output .= ' ';
			}
		}

		/*========================================================================
		 *
		 * Post status
		 *
		 *=======================================================================*/

		switch(get_post_status($post_id)) {
			case 'draft':
			case 'pending':
			case 'future' : $output .= '<i>'; break;
		}


		if($current_post_ID == ($post_id))
			$output .= '<b>';

		$output .= $title;

		if($current_post_ID == ($post_id))
			$output .= '</b>';

		switch(get_post_status($post_id)) {
			case 'draft':
			case 'pending':
			case 'future' : $output .= '</i>'; break;
		}

		$output .= '</a>';


		/*========================================================================
		 *
		 * Search for children
		 *
		 *=======================================================================*/

		$children = get_posts(array(
	        'post_parent' => $post_id,
	        'post_type' => $post_type,
			"orderby" => $child_query['orderby'],
			"order" => $child_query['order'],
	        'post_status' => $child_query['post_status'],
	        'posts_per_page'   => -1,
	    ));

		// Dropdown for children?

		$dropdown = false;
		if ( (($is_child == 'parent') && ($children) && ($this->drop_down_enabled)) &&
			(($this->max_list_count==0) || ($this->current_list_count < $this->max_list_count)) ) {
			$this->current_drop_down_count++;
			$output .= '<div id="ampl-drop-'.$this->current_drop_down_count.'" class="ampl-drop">+</div>';
			$dropdown = true;
		}

		// Output child posts recursively

		if($children) {
			if ($dropdown) {
				$output .= '<div id="ampl-down-'.$this->current_drop_down_count.'" class="ampl-down">';
			}
			$this->current_indent_level++;
			foreach($children as $child) {

				// Count children?
				if (!$dropdown)
					$this->current_list_count++;

				if (($this->max_list_count==0) || ($this->current_list_count <= $this->max_list_count)) {
					$output .= $this->build_post_list_item($child->ID,$post_type,'child',$child_query);
				} else {
					break;
				}
			}
			$this->current_indent_level--;
			if ($dropdown)
				$output .= '</div>';
		}

		$output .= '</div>';

		return $output;

	} // End: function build_post_list_item



	/*========================================================================
	 *
	 * Add post list to all enabled post types
	 *
	 *=======================================================================*/

	function add_post_list_view() {

		// Get settings

		$settings = get_option( 'ampl_settings' );

		$this->max_trim_length = isset($settings['max_trim']) ? $settings['max_trim'] : 0;
		$this->drop_down_enabled = isset($settings['child_dropdown']) ? ($settings['child_dropdown']=="on") : false;
		$this->current_drop_down_count = 0;

		// Get all post types

		$post_types = get_post_types();

		foreach ($post_types as $post_type) {

			$post_types_setting = isset($settings['post_types'][$post_type]) ?
				$settings['post_types'][$post_type] : 'off';

			// If enabled

			if($post_types_setting == 'on' ) {


				/*========================================================================
				 *
				 * Get display options
				 *
				 *=======================================================================*/


				$this->max_list_count = isset($settings['max_limit'][$post_type]) ?
					$settings['max_limit'][$post_type] : 0;

				$post_orderby = isset($settings['orderby'][$post_type]) ?
					$settings['orderby'][$post_type] : 'date';

				$post_order = isset($settings['order'][$post_type]) ?
					$settings['order'][$post_type] : 'ASC';

				$post_exclude = isset($settings['exclude_status'][$post_type]) ?
					$settings['exclude_status'][$post_type] : 'off';

				if ($post_exclude=='on')
					$post_exclude = 'publish';
				else
					$post_exclude = 'any';

				$custom_menu_slug = $post_type;
				$output = '';
				if ($this->max_list_count==0) {
					$max_numberposts = 999;
				} else {
					$max_numberposts = $this->max_list_count;
				}

				$args = array(
					"post_type" => $post_type,
					"parent" => "0",
					"post_parent" => "0",
					"numberposts" => $max_numberposts,
					"orderby" => $post_orderby,
					"order" => $post_order,
					"post_status" => $post_exclude,
					"suppress_filters" => 0
				);

				$child_query = array(
					"orderby" => $post_orderby,
					"order" => $post_order,
					"post_status" => $post_exclude,
					);

				$posts = get_posts($args);

				if($posts) {

					$output .= '</a>';
					$output .= '<div class="ampl post_list_view">'
								. '<div class="post_list_view_headline">' . '<hr>' . '</div>';

					$this->current_list_count = 0;

					foreach ($posts as $post) {
						$this->current_indent_level = 0; // Start all parents at 0
						$this->current_list_count++;

						if ( (($this->max_list_count==0) ||
							($this->current_list_count<=$this->max_list_count)) ) {
								$output .= $this->build_post_list_item($post->ID, $post_type, 'parent', $child_query);
							} else {
								break;
							}
					}

					$output .= '</div>';
					$output .= '<a class="ampl-empty">';

					if($post_type == 'post') {
						add_posts_page( "Title", $output, "edit_posts", $custom_menu_slug, array($this, "empty_page"));
					} else {
						 if ($post_type == 'page') {
							add_pages_page( "Title", $output, "edit_pages", $custom_menu_slug, array($this, "empty_page"));
						} else {
							if($post_type == 'attachment') {
								 add_media_page("Title", $output, "edit_posts", $custom_menu_slug, array($this, "empty_page"));
							} else {
								add_submenu_page(('edit.php?post_type=' . $post_type), "Title", $output, "edit_posts", $custom_menu_slug, array($this, "empty_page"));
							}
						}
					}

				} // if post

			} // if enabled for a post type

		} // for each post type

	} // End: function add_post_list_view

	function empty_page() { /* Empty */ }


	/*========================================================================
	 *
	 * Post list CSS
	 *
	 *=======================================================================*/

	function post_list_css() {

		?><style><?php include('ampl.css');  ?></style><?php

	}


	/*========================================================================
	 *
	 * Footer scripts: dropdown and settings page
	 *
	 *=======================================================================*/

	function admin_footer_scripts() {
		if ( ($this->current_drop_down_count>0) || ($this->is_plugin_page())) {
?>
<script type="text/javascript">
	jQuery(document).ready(function($){
		var dropClass = 'ampl-drop';
		var downID = '#ampl-down-';
		$('.'+dropClass).on('click', function() {
			var id = $(this).attr('id').replace(dropClass+"-", ""); 
			$(downID+id).toggle("fast");
		});
<?php if ($this->is_plugin_page()) { ?>
		var amplSettings = '.ampl-settings-page';
		$(amplSettings+' input').on('click', function() {
			var radio = $(this).prop('name').replace('[orderby]','[order]');
			var value = $(this).prop('value');
			switch(value) {
				case 'title' :
					$(amplSettings+' input[name="'+radio+'"][value="ASC"]').prop('checked',true);
					break;
				case 'date' :
				case 'modified' :
					$(amplSettings+' input[name="'+radio+'"][value="DESC"]').prop('checked',true);
			}
		});
<?php } ?>
	});
</script>
<?php	
		}
	}





/*========================================================================
 *
 * Admin backend
 *
 *=======================================================================*/


	/*========================================================================
	 *
	 * Settings page
	 *
	 *=======================================================================*/

	function create_menu() {
		add_options_page('Post List', 'Post List', 'manage_options', 'admin_menu_post_list_settings_page', array($this,'ampl_settings_page'));
	}

	// Add settings link on plugin list page

	function plugin_settings_link( $links, $file ) {
		$plugin_file = 'admin-menu-post-list/admin-menu-post-list.php';
		//make sure it is our plugin we are modifying
		if ( $file == $plugin_file ) {
			$settings_link = '<a href="' .
				admin_url( 'admin.php?page=admin_menu_post_list_settings_page' ) . '">' .
				__( 'Settings', 'admin_menu_post_list_settings_page' ) . '</a>';
			array_unshift( $links, $settings_link );
		}
		return $links;
	}

	function register_settings() {
		register_setting( 'ampl_settings_field', 'ampl_settings', array($this,'settings_field_validate'));
		add_settings_section('ampl_settings_section', '', array($this,'empty_page'), 'ampl_settings_section_page_name');
		add_settings_field('ampl_settings_field_string', '', array($this,'settings_field_input'), 'ampl_settings_section_page_name', 'ampl_settings_section');
	}

	function settings_field_validate($input) { return $input; }


	function ampl_settings_page() {
		?>
		<div class="wrap ampl-settings-page">
		<h2>Admin Menu Post List</h2>
		<form method="post" action="options.php" style="margin-top:-30px;">
		    <?php settings_fields( 'ampl_settings_field' ); ?>
		    <?php do_settings_sections( 'ampl_settings_section_page_name' ); ?>
		    <?php submit_button(); ?>
		</form>
		<?php
			if ($this->saved_notice)
				echo '<div class="saved-notice">Settings saved.</div>';
		?>
		</div>
		<?php
	}

	/*========================================================================
	 *
	 * Settings field input
	 *
	 *=======================================================================*/

	function settings_field_input() {

		$settings = get_option( 'ampl_settings');

		?>
		<tr class="ampl-border-top ampl-border-bottom">
			<td><b>Post type</b></td>
			<td><b>Max items</b> (0=all)</td>
			<td><b>Order by</b></td>
			<td><b>Order</b></td>
			<td><b>Show only published</b></td>
		</tr>
		<?php

	//	$all_post_types = get_post_types(array());
		$all_post_types = get_post_types(array('public'=>true));
		$exclude_types = array('attachment');
		ksort($all_post_types);


		// Global settings

	 	if(isset( $settings['max_trim'] ) )
		 	$max_trim = $settings['max_trim'];
		else
		 	$max_trim =  '20';

	 	if(isset( $settings['child_dropdown'] ) )
		 	$child_dropdown = $settings['child_dropdown'];
		else
		 	$child_dropdown =  'off';

		// Post type specific settings

		foreach ($all_post_types as $key) {

		 	if(!in_array($key, $exclude_types)) {

				$post_types = isset( $settings['post_types'][ $key ] ) ? esc_attr( $settings['post_types'][ $key ] ) : '';

				$post_type_object = get_post_type_object( $key );
				$post_type_label = $post_type_object->labels->name;

			 	if(isset( $settings['max_limit'][ $key ] ) )
				 	$max_number = $settings['max_limit'][ $key ];
				else
				 	$max_number = '0';

			 	if(isset( $settings['orderby'][ $key ] ) )
				 	$post_orderby = $settings['orderby'][ $key ];
				else
				 	$post_orderby = 'date';

			 	if(isset( $settings['order'][ $key ] ) )
				 	$post_order = $settings['order'][ $key ];
				else
				 	$post_order = 'DESC';

			 	if(isset( $settings['exclude_status'][ $key ] ) )
				 	$post_exclude = $settings['exclude_status'][ $key ];
				else
				 	$post_exclude = 'off';


				?>
				<tr>
					<td>
						<input type="checkbox" id="<?php echo $key; ?>" name="ampl_settings[post_types][<?php echo $key; ?>]" <?php checked( $post_types, 'on' ); ?>/>
						<?php echo '&nbsp;' . ucwords($post_type_label); ?>
					</td>
					<td>
						<input type="text" size="1"
							id="ampl_settings_field_max_limit"
							name="ampl_settings[max_limit][<?php echo $key; ?>]"
							value="<?php echo $max_number; ?>" />
					</td>
					<td>
						<input type="radio" value="date" name="ampl_settings[orderby][<?php echo $key; ?>]" <?php checked( 'date', $post_orderby ); ?>/>
						<?php echo 'created&nbsp;&nbsp;<br>'; ?>
						<input type="radio" value="modified" name="ampl_settings[orderby][<?php echo $key; ?>]" <?php checked( 'modified', $post_orderby ); ?>/>
						<?php echo 'modified&nbsp;&nbsp;<br>'; ?>
						<input type="radio" value="title" name="ampl_settings[orderby][<?php echo $key; ?>]" <?php checked( 'title', $post_orderby ); ?>/>
						<?php echo 'title&nbsp;&nbsp;'; ?>
					</td>
					<td>
						<input type="radio" value="ASC" name="ampl_settings[order][<?php echo $key; ?>]" <?php checked( 'ASC', $post_order ); ?>/>
						<?php echo 'ASC&nbsp;&nbsp;- alphabetical<br>'; ?>
						<input type="radio" value="DESC" name="ampl_settings[order][<?php echo $key; ?>]" <?php checked( 'DESC', $post_order ); ?>/>
						<?php echo 'DESC&nbsp; - new to old'; ?>
					</td>
					<td>
						<input type="checkbox" name="ampl_settings[exclude_status][<?php echo $key; ?>]" <?php checked( $post_exclude, 'on' ); ?>/>
					</td>
				</tr>
				<?php
			} // if not excluded
		} // foreach post type
		?>

		<tr class="ampl-border-top">
			<td>
				<b>Limit title length</b>
			</td>
			<td>
				<input type="text" size="1"	name="ampl_settings[max_trim]"
								value="<?php echo $max_trim; ?>" />
			</td>
		</tr>
		<tr>
			<td>
				<b>Child posts in dropdown?</b>
			</td>
			<td>
				<input type="checkbox" name="ampl_settings[child_dropdown]" <?php checked( $child_dropdown, 'on' ); ?>/>
			</td>
		</tr>
		<?php

	}


/*========================================================================
 *
 * Helper functions
 *
 *=======================================================================*/



	function is_plugin_page() {
		global $pagenow;
		$page = isset($_GET['page']) ? $_GET['page'] : null;
		return ($pagenow == 'options-general.php' && $page == 'admin_menu_post_list_settings_page');
	}

	function remove_settings_saved_notice(){
		if ($this->is_plugin_page()) { 
			if ( (isset($_GET['updated']) && $_GET['updated'] == 'true') ||
				(isset($_GET['settings-updated']) && $_GET['settings-updated'] == 'true') ) {
		      //this will clear the update message "Settings Saved" totally
				unset($_GET['settings-updated']);
				$this->saved_notice = true;
			}
		}
	}


}
new AdminMenuPostList;

