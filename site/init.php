<?php

$config->aliasHandles = require_once(__DIR__ . '/fractal-handles.php');

$loader = new Twig_Loader_Chain(array(
	new Alias_Loader($config->aliasHandles),
	new Twig_Loader_Filesystem($config->paths->templates . 'views'),
));
$twig = new Twig_Environment($loader);
$twig->addFunction(new Twig_SimpleFunction('static', function ($path) use($config) {
  return $config->urls->templates . ltrim($path, '/');
}));

$this->wire('twig', $twig, true);