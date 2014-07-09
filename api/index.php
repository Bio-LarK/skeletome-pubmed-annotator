<?php
require 'vendor/autoload.php';


define("ARCHIVE_API_BASE_URL", "http://115.146.86.140/archive/drupal/api/");
define("BIOLARK_API_BASE_URL", "http://115.146.86.140:8080/biolark/");

$app = new \Slim\Slim();

$app->get('/hello/:name', function ($name) {
    echo "Hello, $name";

    // http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=science[journal]+AND+breast+cancer+AND+2008[pdat]
});

$app->get('/pubmed/:pubmedId', function ($pubmedId) {
    $article = json_decode(json_encode(simplexml_load_file("http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=$pubmedId&retmode=xml")));
    $article->id = $pubmedId;
    echo json_encode($article);
});

$app->get('/pubmed/:pubmedId/annotations', function ($pubmedId) {
    $article = json_decode(json_encode(simplexml_load_file("http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=$pubmedId&retmode=xml")));

    $abstract = '';

    $pubmedAbstractText = $article->PubmedArticle->MedlineCitation->Article->Abstract->AbstractText;
    $abstract = $pubmedAbstractText;
    if (is_array($pubmedAbstractText)) {
        foreach ($pubmedAbstractText as $abstractText) {
            $abstract .= $abstractText;
        }
    }

    $url = BIOLARK_API_BASE_URL . 'annotate';

    $data = array('text' => $abstract, 'dataSource' => 'Human Phenotype Ontology');

    // use key 'http' even if you send the request to https://...
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ),
    );
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);

    $matches = json_decode($result);

    $annotations = array_map(function ($annotation) {
        $url = ARCHIVE_API_BASE_URL . "hpo.json?parameters%5Buri%5D=$annotation->uri";
        $hpos = json_decode(file_get_contents($url));
        if (count($hpos)) {
            $annotation->hpo = $hpos[0];
        }
        return $annotation;
    }, $matches);

    echo json_encode($annotations);
});

$app->get('/hpos', function () use ($app) {

    $name = $app->request->get('name');
    $uri = $app->request->get('uri');

    if(!$name && !$uri) {
        return array();
    }

    if ($name) {
        $url = ARCHIVE_API_BASE_URL . "hpo.json?parameters%5Bname%5D=$name";
    } else if ($uri) {
        $url = ARCHIVE_API_BASE_URL . "hpo.json?parameters%5Buri%5D=$uri";
    }

    $hpos = json_decode(file_get_contents($url));

    echo json_encode($hpos);
});
$app->run();
