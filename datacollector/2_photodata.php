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

function extractString($str, $start, $end, $case = true) {

	if(!$case) {
		$str = strtolower($str);
		$start = strtolower($start);
		$end = strtolower($end);
	}

	$pos_start = strpos($str, $start);

	if($pos_start === false) {
		return null;
	}
	//saveLog('strpos('.$end.', ('.$pos_start.' + '.strlen($start).'))');
	$pos_end = strpos($str, $end, ($pos_start + strlen($start)));

	if(($pos_start !== false) && ($pos_end !== false)) {
		$pos1 = $pos_start + strlen($start);
		$pos2 = $pos_end - $pos1;
		return substr($str, $pos1, $pos2);
	}
	
	return null;
} 

function parse($content) {

    $item = array();
    
    $item['thumb_url'] = extractString($content, '<li class="hoofdafbeelding">', '" alt=""');
    if(!is_null($item['thumb_url'])) {
        $item['thumb_url'] = trim($item['thumb_url']);
        $item['thumb_url'] = substr($item['thumb_url'], 10);
    }
    
    $item['street_name'] = extractString($content, '<span class="label">Straatnaam</span>', '</span>');
    
    if(!is_null($item['street_name'])) {
        $item['street_name'] = trim(strip_tags($item['street_name']));
    }
    
    return $item;
}

/**
 * Attempt to extract an address from a caption.
 * Check for the occurance of typical Dutch street names and locations
 * Add any previous words if they are capitalized as they are part of the name as well.
 * Some exceptions for major locations in The Hague have been added.
*/
function getAddressFromCaption($caption) {

    $address = '';
    
    $extensions = array('straat', 'weg', 'laan', 'plein', 'kade', 'hof', 'hout', 'park', 'markt', 'land', 'einde', 'veld', 'dam', 'pad', 'burg', 'poort', 'dijk', 'straatje', 'berg');
    
    if(strpos($caption, 'Plein 1813') !==  false) {
        return 'Plein 1813';
    }

    $words = explode(' ', $caption);
    
    for($i = 0;  $i < count($words); $i++) {
        
        foreach($extensions as $extension) {
            if($p = strpos($words[$i], $extension) !== false) {
            
                $address = '';
            
                if(ucfirst($words[$i - 1]) == $words[$i - 1] || $words[$i - 1] == 'van' || $words[$i - 1] == 'de') {
                    $address = $words[$i - 1].' ';
                                    
                    if($i > 2 && ucfirst($words[$i - 2]) == $words[$i - 2]) {
                        $address = $words[$i - 2].' '.$address;
                                             
                        if($i > 3 && ucfirst($words[$i - 3]) == $words[$i - 3]) {
                            $address = $words[$i - 3].' '.$address;
                        }
                    }
                }
            
                if($p > 0) {
                
                    if($address == 'de ' || $address == 'van ') {
                        $address = '';
                    }
                    
                    return trim($address.$words[$i], ' .,()');
                }
            }
        }
    }
    //if none, found, maybe these?
    if(strpos($caption, 'Laan van Nieuw Oost Indië') !== false) {
        return 'Laan van Nieuw Oost Indië';
    }
    
    if(strpos($caption, 'Laan van Meerdervoort') !== false) {
        return 'Laan van Meerdervoort';
    }
    
    if(strpos($caption, 'Achterom') !== false) {
        return 'Achterom';
    }

    if(strpos($caption, 'Spui') !==  false) {
        return 'Spui';
    }
        
    if(strpos($caption, 'Geest') !==  false) {
        return 'Geest';
    }
    
    if(strpos($caption, 'Korte Poten') !== false) {
        return 'Korte Poten';
    }
    
    if(strpos($caption, 'Lange Poten') !== false) {
        return 'Lange Poten';
    }
    
    if(strpos($caption, 'Plaats') !== false) {
        return 'Plaats';
    }
    
    if(strpos($caption, 'Kortenbos') !== false) {
        return 'Kortenbos';
    }
       
    return null;
}

function getLatLng($address) {

    $url = "http://maps.googleapis.com/maps/api/geocode/json?region=nl&language=nl&sensor=false&bounds=51.992069,4.126740|52.126322,4.475555&address=".urlencode($address);
    
    
    echo $url."\r\n";

    $response = getPageContent($url);
    $json = json_decode($response, true);

    if($json['status'] == 'OK') {
        return $json['results'][0]['geometry']['location'];
    }

    return false;
}


$images  = unserialize(file_get_contents('data/images.dat'));

//print_r($images);exit();

$page_url_template = 'http://www.haagsebeeldbank.nl/zoeken/weergave/search/layout/result/indeling/detail/form/advanced/q/zoekveld/';

for($i = 0; $i < count($images); $i++) {
    
    $image = $images[$i];
    
    if(!isset($image['thumb_url'])) {
        $url = $page_url_template.$image['thumb_id'];
        $content = getPageContent($url);
       // $content = file_get_contents('test.html');
        
        $item = parse($content);
        $image['thumb_url'] = $item['thumb_url'];
        $image['street_name'] = $item['street_name'];
        $image['street_name_guessed'] = '';
    }    
//    print_r(getLatLng($image['caption']));
    
    if(strlen($image['street_name']) > 0) {
        $location = getLatLng($image['street_name'].', Den Haag');
        if(is_array($location)) {
            $image['latitude'] = $location['lat'];
            $image['longitude'] = $location['lng'];
        } else {
            //if no location found see if we can find it by removing a ; from there
            $p = strpos($image['street_name'], ';');
            
            if($p !== false) {
                $image['street_name_guessed'] = trim(substr($image['street_name'], 0, $p));
                $location = getLatLng($image['street_name_guessed']);
                if(is_array($location)) {
                    $image['latitude'] = $location['lat'];
                    $image['longitude'] = $location['lng'];
                }
            }
        
        }
    }
    
    if(!isset($image['latitude'])) {
        $image['street_name_guessed'] = getAddressFromCaption($image['caption']);
        $location = getLatLng($image['street_name_guessed'].', Den Haag');
        print_r($location);
        if(is_array($location)) {
            $image['latitude'] = $location['lat'];
            $image['longitude'] = $location['lng'];
        }
    }
    
    $images[$i] = $image;
    
    print_r($image);
    
    if($i == 5) {
        break;
    }
}

file_put_contents('data/images2.dat', serialize($images));

exit();

?>