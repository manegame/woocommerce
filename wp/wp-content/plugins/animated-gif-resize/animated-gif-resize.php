<?php

/*
Plugin Name: Animated Gif Resize
Plugin URI: http://wordpress.org/plugins/animated-gif-resize/
Description: Enable WordPress to properly resize animated GIFs.
Author: Brendon Boshell
Version: 1.0
Author URI: http://www.brendonboshell.co.uk/
*/

function bbpp_animated_gif_wp_image_editors($editors) {
	if (!class_exists("Bbpp_Animated_Gif")) {
		require_once "GifFrameExtractor.php";
		require_once "GifCreator.php";
		require_once "Bbpp_Animated_Gif.php";
	}
	
	$new_editors = array();
	
	foreach ($editors as $editor) {
		if ($editor == "WP_Image_Editor_GD") {
			$new_editors[] = "Bbpp_Animated_Gif";
		}
		
		$new_editors[] = $editor;
	}
	
	return $new_editors;
}

add_filter("wp_image_editors", "bbpp_animated_gif_wp_image_editors", 10, 1);