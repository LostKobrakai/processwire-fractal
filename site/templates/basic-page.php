<?php

$content = $twig->render('@basic-page', array(
	'title' => $page->title,
	'editable' => $page->editable(),
	'editURL' => $page->editURL
));

wireRenderFile('_main', compact('content'));