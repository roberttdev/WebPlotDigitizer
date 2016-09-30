<?php
/**
 * Created by PhpStorm.
 * User: rwilliams
 * Date: 9/22/16
 * Time: 3:37 PM
 */
$url=$_GET['url'];
$img = file_get_contents($url);
$fn = substr(strrchr($url, "/"), 1);
file_put_contents("../images/" . $fn,$img);

?>