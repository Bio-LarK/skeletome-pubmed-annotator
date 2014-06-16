<?php
require 'vendor/autoload.php';


$app = new \Slim\Slim();

$app->get('/hello/:name', function ($name) {
    echo "Hello, $name";

    // http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=science[journal]+AND+breast+cancer+AND+2008[pdat]
});

$app->get('/pubmed/:pubmedId', function ($pubmedId) {
    $article = json_decode(json_encode(simplexml_load_file("http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=$pubmedId&retmode=xml")));
    echo json_encode($article);
});

$app->get('/pubmed/:pubmedId/annotations', function ($pubmedId) {
    $article = json_decode(json_encode(simplexml_load_file("http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=$pubmedId&retmode=xml")));

    $abstract = '';
    foreach ($article->PubmedArticle->MedlineCitation->Article->Abstract->AbstractText as $abstractText) {
        $abstract .= $abstractText;
    }

    // $text = html_entity_decode(strip_tags($text));

    $url = 'http://115.146.86.140:8080/biolark/annotate';
    $data = array('text' => $abstract, 'dataSource' => 'Human Phenotype Ontology|Bone Dysplasia Ontology');

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
    print_r($matches);
});

$app->post('/annotate', function () {
    $jsonData = json_decode($app->request->getBody());

});

$app->run();
