<?php

// -------
// -------
// -------
// CORS
if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    list($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']) = explode(':', base64_decode(substr($_SERVER['REDIRECT_HTTP_AUTHORIZATION'], 6)));
}

add_filter('query_vars', function ($vars) {
    $vars[] = 'post_parent';
    return $vars;
});

// -------
// -------
// -------
// CUSTOM IMAGE SIZES
add_action('after_setup_theme', 'image_size_setup');
function image_size_setup()
{
    add_image_size('pwr-small', 500);
    add_image_size('pwr-medium', 800);
    add_image_size('pwr-large', 1400);
    // add_image_size('slide-small', 300, 220, true);
    // add_image_size('slide-large', 710, 480, true);
}

// -------
// -------
// -------
// ALLOW SVG
// function cc_mime_types($mimes)
// {
//     $mimes['svg'] = 'image/svg+xml';
//     return $mimes;
// }
// add_filter('upload_mimes', 'cc_mime_types');
// function bodhi_svgs_disable_real_mime_check($data, $file, $filename, $mimes)
// {
//     $wp_filetype = wp_check_filetype($filename, $mimes);
//
//     $ext = $wp_filetype['ext'];
//     $type = $wp_filetype['type'];
//     $proper_filename = $data['proper_filename'];
//
//     return compact('ext', 'type', 'proper_filename');
// }
// add_filter('wp_check_filetype_and_ext', 'bodhi_svgs_disable_real_mime_check', 10, 4);

// -------
// -------
// -------
// FILTER P-TAGS ON IMG
// function filter_ptags_on_images($content)
// {
//     return preg_replace('/<p>(\s*)(<img .* \/>)(\s*)<\/p>/iU', '\2', $content);
// }
//
// add_filter('acf_the_content', 'filter_ptags_on_images');

// -------
// -------
// -------
// WRAP IFRAMES IN DIV
// function div_wrapper($content)
// {
//     // match any iframes
//     $pattern = '~<iframe.*</iframe>|<embed.*</embed>~';
//     preg_match_all($pattern, $content, $matches);
//
//     if (is_array($matches[0])) {
//         foreach ($matches[0] as $match) {
//             // wrap matched iframe with div
//         $wrappedframe = '<div class="embed-responsive">' . $match . '</div>';
//
//         //replace original iframe with new in content
//         $content = str_replace($match, $wrappedframe, $content);
//         }
//     }
//
//     return $content;
// }
// add_filter('the_content', 'div_wrapper');

// -------
// -------
// -------
// REMOVE WIDTH/HEIGHT FROM IMAGES
// function remove_width_attribute($html)
// {
//     $html = preg_replace('/(width|height)="\d*"\s/', "", $html);
//     return $html;
// }
// add_filter('post_thumbnail_html', 'remove_width_attribute', 10);
// add_filter('image_send_to_editor', 'remove_width_attribute', 10);

// -------
// -------
// -------
// CUSTOM COLUMNS
// function my_page_columns($columns)
// {
//     $columns = array(
//         'cb'        => '<input type="checkbox" />',
//         'Order'    =>    'Order',
//         'title'    => 'Title',
//         'categories'    =>    'Categories',
//     );
//     return $columns;
// }
// function my_custom_columns($column)
// {
//     global $post;
//     if ($column == 'Order') {
//         $order = get_field('order', $post->ID);
//         echo $order;
//     }
// }
// add_action("manage_posts_custom_column", "my_custom_columns");
// add_filter("manage_edit-post_columns", "my_page_columns");

// -------
// -------
// -------
// REST API
//
//  function prefix_get_post($request)
//  {
//      $id = $request['id'];
//      $likes = get_field('likes', $id) + 1;
//      update_field('likes', $likes, $id);
//      return rest_ensure_response($id);
//  }
//
//  function prefix_get_post_arguments()
//  {
//      $args = array();
//      $args['id'] = array(
//      'description' => esc_html__('Post id', 'my-text-domain'),
//      'type'        => 'string'
//    );
//      return $args;
//  }
//
// function prefix_register_example_routes()
// {
//     register_rest_route('like/v1', '/add', array(
//       'methods'  => WP_REST_Server::CREATABLE,
//       'callback' => 'prefix_get_post',
//       'args' => prefix_get_post_arguments()
//   ));
// }
//
// add_action('rest_api_init', 'prefix_register_example_routes');
// add_filter('rest_allow_anonymous_comments', '__return_true');

// -------
// -------
// -------
// ADD EDITOR STYLES
// add_editor_style();

// -------
// -------
// -------
// CUSTOM POST TYPE
// add_action('init', 'news_post_type');
// function news_post_type()
// {
//     register_post_type('nyhed',
//     array(
//       'labels' => array(
//         'name' => __('Nyheder'),
//         'singular_name' => __('Nyhed')
//       ),
//       'public' => true,
//       'show_in_rest' => true,
//       'has_archive' => true,
//     )
//   );
// }

// -------
// -------
// -------
// CUSTOM TAXONOMY
// add_action('init', 'create_project_tax');
//
// function create_project_tax()
// {
//     register_taxonomy(
//         'category',
//         'project',
//         array(
//             'label' => __('Category'),
//             'rewrite' => array( 'slug' => 'category' ),
//             'hierarchical' => true,
//             'show_in_rest' => true
//         )
//     );
// }

// -------
// -------
// -------
// CUSTOMIZE EDITOR
add_filter('acf/fields/wysiwyg/toolbars', 'my_toolbars');
function my_toolbars($toolbars)
{
    $toolbars['Full' ] = array();
    $toolbars['Full' ][1] = array('italic', 'bullist', 'link', 'unlink');

    // remove the 'Basic' toolbar completely
    unset($toolbars['Basic' ]);

    // return $toolbars - IMPORTANT!
    return $toolbars;
}


// -------
// -------
// -------
// ADD CUSTOM FORMATS TO EDITOR
// function my_mce_buttons_2($buttons)
// {
//     $buttons[] = 'styleselect';
//     return $buttons;
// }
// add_filter('mce_buttons_2', 'my_mce_buttons_2');
// // Callback function to filter the MCE settings
// function my_mce_before_init_insert_formats($init_array)
// {
//     if (get_post_type() == "page" || get_post_type() == "post") {
//         $texts = get_posts(array('post_type' => 'text', 'posts_per_page' => -1));
//         var_dump($texts);
//         foreach ($texts as $text) {
//             $style_formats[] = array(
//           'title' => $text->post_title,
//           'inline' => 'span',
//           'classes' => 'text-link ' . $text->post_name,
//           'wrapper' => true,
//           'attributes' => array('data-href' => $text->post_name, 'data-id' => strval($text->ID))
//         );
//         }
//     }
//
//     if (get_post_type() == "item") {
//         $cats = get_terms(array('taxonomy' => 'collection', 'hide_empty' => false));
//         foreach ($cats as $cat) {
//             $style_formats[] = array(
//             'title' => $cat->name,
//             'inline' => 'span',
//             'classes' => 'collection-link ' . $cat->slug,
//             'wrapper' => true,
//             'attributes' => array('data-href' => $cat->slug, 'data-id' => strval($cat->term_id))
//           );
//         }
//     }
//
//     // var_dump($style_formats);
//
//     $init_array['style_formats'] = json_encode($style_formats);
//     return $init_array;
// }
// add_filter('tiny_mce_before_init', 'my_mce_before_init_insert_formats');



// -------
// -------
// -------
// MAKE ACF GOOGLE MAPS WORK
// add_filter('acf/settings/google_api_key', function ($value) {
//     return 'AIzaSyA5-e0tQI0E6nqkbdKr19d9jUx7vlDj4Vg';
// });

// Allow custom order in REST 
add_action('admin_init', 'posts_order');
function posts_order()
{
  add_post_type_support('post', 'page-attributes');
}
function my_rest_post_query($args, $request)
{
    $args['orderby'] = 'menu_order';
    $args['order']   = 'asc';

    return $args;
}
add_filter('rest_post_query', 'my_rest_post_query', 10, 2);
