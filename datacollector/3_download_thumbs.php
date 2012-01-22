<?php

set_time_limit(0);
ini_set('memory_limit', '64M');

define('USER_AGENT', 'Mozilla/5.0 (compatible; robot)');

header('Content-Type: text/plain; charset=UTF-8');

function getPageContent($url) {

	$cUrl = curl_init();
	curl_setopt($cUrl, CURLOPT_URL, $url);
	curl_setopt($cUrl, CURLOPT_HEADER, false);
	//curl_setopt($cUrl, CURLOPT_NOBODY, true);
	curl_setopt($cUrl, CURLOPT_USERAGENT, USER_AGENT);
	curl_setopt($cUrl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($cUrl, CURLOPT_TIMEOUT, 10);
	$body = curl_exec($cUrl);
	curl_close($cUrl);

	return $body;
}

$images  = unserialize(file_get_contents('data/images2.dat'));

$i = 0;
foreach($images as $image) {

    if(isset($image['thumb_url']) && isset($image['latitude']) && isset($image['longitude'])) {
    
        $path = '../thumbs/'.$image['thumb_id'].'.jpg';
        
        if(!file_exists($path)) {
            $content = getPageContent($image['thumb_url']);
            file_put_contents($path, $content);
            echo('Saved image '.$image['thumb_url']."\n");
        }
    }    
    
    $i++;
    if($i = 1) {
        //break;
    }
}

?>