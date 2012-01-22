<?php

header('Content-Type: text/plain');

set_time_limit(0);

define('ICON_CROP', 5);
define('ICON_WIDTH', 77);
define('ICON_HEIGHT', 77);
define('ICON_BORDER', 0);

$photo_delete = false;
$icon_delete = false;
$error = null;

function stripExtension($str) {
    
    $pos = strrpos($str, '.');
    
    if($pos === false) {
         return $str;
    }
    
    return substr($str, 0, $pos);  
}

function getScaledIcon($image) {

	$image_width = imagesx($image);
	$image_height = imagesy($image);
	
	$target_width = ICON_WIDTH - (ICON_BORDER * 2) + (ICON_CROP * 2);
	$target_height = ICON_HEIGHT - (ICON_BORDER * 2) + (ICON_CROP * 2);
	
	$pos_x = 0;
	$pos_y = 0;
	
	if($image_width <= $target_width && $image_height <= $target_height) {
		
		$icon_width = $image_width;
		$icon_height = $image_height;
		
	} else {
		
		$factor = ceil($image_width / $target_width);
		$icon_width = $target_width;
		$icon_height = ceil($image_height / $factor);
	
		if($icon_height < $target_height) {
			
			$factor = ceil($image_height / $target_height);
			$icon_height = $target_height;
			$icon_width = ceil($image_width / $factor);
		}
		
		if($icon_width > $target_width) {
			$pos_x = 0 - floor(($icon_width - $target_width) / 2);
		}
	
		if($icon_height > $target_height) {
			$pos_y = 0 - floor(($icon_height - $target_height) / 2);
		}
	}

	$image_output = imagecreatetruecolor($target_width, $target_height); 
	imagecopyresampled($image_output, $image, $pos_x, $pos_y, 0, 0, $icon_width + (ICON_CROP * 2), $icon_height + (ICON_CROP * 2), imagesx($image), imagesy($image)); 
	imagedestroy($image); 

	$image_output2 = imagecreatetruecolor(ICON_WIDTH, ICON_HEIGHT); 
	$white = imagecolorallocate($image_output2, 255, 255, 255);
    imagefill($image_output2, 0, 0, $white);
    imagecopy($image_output2, $image_output, ICON_BORDER, ICON_BORDER, (0 + ICON_CROP), (0 + ICON_CROP), $target_width, $target_height); 
    imagedestroy($image_output); 

	return $image_output2; 
} 

function createIcon($url) {
    
    $file_dir = 'cache/thumb/';
    
    $file_path = $file_dir.md5($url).'.jpg';
    
    if(!file_exists($file_path)) {
        
        $icon_image = ImageCreateFromJPEG($url);
        $icon_image = getScaledIcon($icon_image);
        
        imagejpeg($icon_image, $file_path, 70);        
    }
    
}
$dir = '../thumbs/';

if($handle = opendir($dir)) {

    /* This is the correct way to loop over the directory. */
    while(false !== ($filename = readdir($handle))) {
    
        if(substr($filename, 0, 1) == '.') {
            continue;
        }
        
        if(!is_file($dir.$filename)) {
            continue;
        }
        
        $icon_input_path = $dir.$filename;
        $icon_output_path = '../icons/'.stripExtension($filename).'.png';
        
        if(file_exists($icon_output_path)) {
            continue;
        }
        
        try {
            $icon_image = ImageCreateFromJPEG($icon_input_path);
            $icon_image = getScaledIcon($icon_image);
            
            imagepng($icon_image, $icon_output_path);
            
            echo('Image saved '.$icon_output_path."\n");
        } catch(Exception $e) {
            echo 'Unable to create icon '.$icon_input_path;
        }

        ob_flush();
        
        //break;
    }
    
     closedir($handle);
 }

?>