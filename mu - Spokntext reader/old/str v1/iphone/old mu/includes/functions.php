<?php
# get all .lbi files in the directory "Library"
$handle = opendir ("../Library");
while ($filename = readdir ($handle)) if (substr ($filename, -4) == ".lbi") $filenames[] = $filename;
foreach ($filenames as $filename) {
	#start div with filename
	echo "\n<div id=\"" . substr ($filename, 0, -4) . "\">";
	$html = file_get_contents ("../Library/" . $filename);
	
	#remove metatags from .lbi files
	$html = preg_replace ("%<meta.*?>%sim", "", $html);
	
	#Correct the path to the image folder
	$html = str_replace("src=\"images/", "src=\"Library/images/", $html);
	
	#Remove .htm extensions
	$html = preg_replace ("%\..?htm.*?\"%sim", '"', $html);
	
	echo $html;
	
	#close div
	echo "</div>\n";
}
?>