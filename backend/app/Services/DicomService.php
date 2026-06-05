<?php

namespace App\Services;

class DicomService
{
    protected $baseUrl;
    protected $username;
    protected $password;

    protected $getUrl;
    protected $postUrl;

    public function __construct($param)
    {
        $this->baseUrl  = rtrim($param['stow_url'], '/');

        $this->username = $param['stow_username'];
        $this->password =  $param['stow_password'];

        $this->getUrl  = $param['stow_get'] ?? '';
        $this->postUrl = $param['stow_post'] ?? '';
    }

    /**
     * ✅ STOW-RS (Upload DICOM)
     */
    public function stow(array $files): array
	{
		$url = $this->resolvePostUrl();

		$boundary = "boundary_" . uniqid();
		$body = $this->buildMultipartBody($files, $boundary);

		$result = $this->request('POST', $url, $body, [
			"Content-Type: multipart/related; type=\"application/dicom\"; boundary=$boundary",
			"Accept: application/dicom+json"
		]);

		return $this->formatStowResponse($result);
	}

    /**
     * ✅ QIDO-RS (Search)
     */
    public function qido(array $query = []): array
    {
        $url = $this->resolveGetUrl();

        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }
		 
		$result = $this->request('GET', $url, null, [
            "Accept: application/dicom+json"
        ]);
		
		return $this->formatStowResponse($result);
    }
	
	/**
     * ✅ QIDO-RS (Delete)
     */
	 
	public function delete()
    {
        $url = $this->resolveGetUrl();

        $result = $this->request('DELETE', $url, null, [
            "Accept: application/json"
        ]);

        return $this->formatStowResponse($result);
    }
	
	  
	protected function formatStowResponse(array $result): array
	{
		$raw = $result['response'];

		// extract URLs (WADO links)
		preg_match_all('/https?:\/\/[^\s]+/', $raw, $urlMatches);
		$urls = $urlMatches[0] ?? [];

		// extract UIDs
		preg_match_all('/1\.\d+(?:\.\d+)+/', $raw, $uidMatches);
		$uids = $uidMatches[0] ?? [];

		return [
			'status'   => $result['status'],
			'success'  => $result['success'],
			'error'    => $result['error'],
			'raw'      => $raw,
			'data' => json_decode($raw,true) ?? NULL,
		];
	}

    /**
     * ✅ Build STOW multipart body
     */
    protected function buildMultipartBody(array $files, string $boundary): string
    {
        $body = "";

        foreach ($files as $file) {

            if (!file_exists($file)) continue;

            $body .= "--$boundary\r\n";
            $body .= "Content-Type: application/dicom\r\n";
            $body .= "Content-Transfer-Encoding: binary\r\n\r\n";
            $body .= file_get_contents($file) . "\r\n";
        }

        $body .= "--$boundary--\r\n";

        return $body;
    }

    /**
     * ✅ HTTP request
     */
    protected function request(string $method, string $url, $body = null, array $headers = []): array
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_VERBOSE, false);
        curl_setopt($ch, CURLOPT_USERPWD, "{$this->username}:{$this->password}");
        curl_setopt($ch, CURLOPT_TIMEOUT, 0);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30); 

        if ($method === 'POST') {
			curl_setopt($ch, CURLOPT_POST, true);

			if ($body !== null) {
				curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
			}

		} elseif ($method !== 'GET') {
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

			if ($body !== null) {
				curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
			}
		}

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);

        curl_close($ch);

        return [
            'status'   => $status,
            'success'  => $response !== false,
            'error'    => $error,
            'response' => $response
        ];
    }

    /**
     * ✅ Resolve GET URL safely
     */
    protected function resolveGetUrl(): string
    {
        return str_starts_with($this->getUrl, 'http')
            ? $this->getUrl
            : $this->baseUrl . '/' . ltrim($this->getUrl, '/');
    }

    /**
     * ✅ Resolve POST URL safely
     */
    protected function resolvePostUrl(): string
    {
        return str_starts_with($this->postUrl, 'http')
            ? $this->postUrl
            : $this->baseUrl . '/' . ltrim($this->postUrl, '/');
    }
	
	public function setGetUrl($url)
	{
		$this->getUrl = $url;
		return $this;
	}

	public function setPostUrl($url)
	{
		$this->postUrl = $url;
		return $this;
	}
}