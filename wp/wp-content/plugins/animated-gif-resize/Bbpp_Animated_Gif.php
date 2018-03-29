<?php

class Bbpp_Animated_Gif extends WP_Image_Editor_GD {
	public $image_animated_gif = null;
	
	public function save( $filename = null, $mime_type = null ) {
		$is_animated_gif = GifFrameExtractor::isAnimatedGif($this->file);
		
		if (!$is_animated_gif) {
			return parent::save($filename, $mime_type);
		}
			
		$saved = $this->_save_animated_gif( $this->image_animated_gif, $filename, $mime_type );

		if ( ! is_wp_error( $saved ) ) {
			$this->file = $saved['path'];
			$this->mime_type = $saved['mime-type'];
		}

		return $saved;
	}

	public function stream( $mime_type = null ) {
		$is_animated_gif = GifFrameExtractor::isAnimatedGif($this->file);
		
		if (!$is_animated_gif) {
			return parent::stream($mime_type);
		}
		
		header( 'Content-Type: image/gif' );
		if ($this->image_animated_gif) {
			echo $this->image_animated_gif->getGif();
		} else {
			echo file_get_contents($this->file);
		}
		
		return true;
	}

	public function resize( $max_w, $max_h, $crop = false ) {
		$is_animated_gif = GifFrameExtractor::isAnimatedGif($this->file);
		
		if (!$is_animated_gif) {
			return parent::resize($max_w, $max_h, $crop = false);
		}
		
		if ( ( $this->size['width'] == $max_w ) && ( $this->size['height'] == $max_h ) )
			return true;

		$resized = $this->_resize_animated_gif( $max_w, $max_h, $crop );

		if ( ! is_wp_error( $resized ) ) {
			$this->image_animated_gif = $resized;
			return true;
		} elseif ( is_wp_error( $resized ) )
			return $resized;

		return new WP_Error( 'image_resize_error', __('Image resize failed.'), $this->file );
	}

	public function multi_resize($sizes) {
		$is_animated_gif = GifFrameExtractor::isAnimatedGif($this->file);
		
		if (!$is_animated_gif) {
			return parent::multi_resize($sizes);
		}
		
		$metadata = array();
		$orig_size = $this->size;
		
		foreach ($sizes as $size => $size_data) {
			$image = $this->_resize_animated_gif( $size_data['width'], $size_data['height'], $size_data['crop'] );
			
			if( ! is_wp_error( $image ) ) {
				$resized = $this->_save_animated_gif( $image );

				unset( $image );

				if ( ! is_wp_error( $resized ) && $resized ) {
					unset( $resized['path'] );
					$metadata[$size] = $resized;
				}
			}

			$this->size = $orig_size;
		}
		
		return $metadata;
	}
	
	public function _save_animated_gif_file($gc, $filename) {
		file_put_contents($filename, $gc->getGif());
		return true;
	}
	
	protected function _save_animated_gif($image, $filename = null, $mime_type = null) {
		// save it
		list( $filename, $extension, $mime_type ) = $this->get_output_format( $filename, $mime_type );
		
		if ( ! $filename )
			$filename = $this->generate_filename( null, null, $extension );
			
		if (!$this->make_image($filename, array($this, "_save_animated_gif_file"), array($image, $filename)))
			return new WP_Error( 'image_save_error', __('Image Editor Save Failed') );
		
		// Set correct file permissions
		$stat = stat( dirname( $filename ) );
		$perms = $stat['mode'] & 0000666; //same permissions as parent folder, strip off the executable bits
		@ chmod( $filename, $perms );

		return array(
			'path' => $filename,
			'file' => wp_basename( apply_filters( 'image_make_intermediate_size', $filename ) ),
			'width' => $this->size['width'],
			'height' => $this->size['height'],
			'mime-type'=> $mime_type,
		);
	}
	
	protected function _resize_animated_gif($max_w, $max_h, $crop = false) {
		$frame_resources = array(); // GD resources of each frame
		$durations = array(); // ms duration of each frame
		
		$gfe = new GifFrameExtractor();
		$gfe->extract($this->file); // get frames from gif
		
		$dims = image_resize_dimensions($this->size['width'], $this->size['height'], $max_w, $max_h, $crop);
		
		if (!$dims) {
			return new WP_Error('error_getting_dimensions', __('Could not calculate resized image dimensions'), $this->file);
		}
		
		list( $dst_x, $dst_y, $src_x, $src_y, $dst_w, $dst_h, $src_w, $src_h ) = $dims;
		
		foreach ($gfe->getFrames() as $frame) {
			$img = $frame["image"];
			$duration = $frame["duration"];
			$frame_resize_resource = wp_imagecreatetruecolor( $dst_w, $dst_h );
			
			// resize frame
			imagecopyresampled( $frame_resize_resource, $img, $dst_x, $dst_y, $src_x, $src_y, $dst_w, $dst_h, $src_w, $src_h );
			
			if (is_resource($frame_resize_resource)) {
				$frame_resources[] = $frame_resize_resource;
				$durations[] = $duration;
			}
		}
		
		if ($frame_resources) {
			$this->update_size( $dst_w, $dst_h );
		
			// reconstruct small gif:
			$gc = new GifCreator();
			$gc->create($frame_resources, $durations, 0);
			
			return $gc;
		} else {
			return new WP_Error( 'image_resize_error', __('Image resize failed.'), $this->file );
		}
	}
}