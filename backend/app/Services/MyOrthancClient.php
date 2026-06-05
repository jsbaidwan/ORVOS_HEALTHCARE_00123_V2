<?php

namespace App\Services;

use Mkinyua53\Orthanc\Http\Clients\OrthancClient;

class MyOrthancClient extends OrthancClient
{
    /**
     * Get raw (non-JSON) response, e.g. for image previews
     */
    public function getRaw(string $uri): string
    {
        $response = $this->client->request('GET', $uri);
        return $response->getBody()->getContents();
    }
}
