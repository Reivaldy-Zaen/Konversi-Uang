<?php
header('Content-Type: application/json');

// --- GANTI DENGAN API KEY ANDA ---
$apiKey = '8e8e02475155ac697cb41753'; 
$baseCurrency = 'USD';
$apiUrl = "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$baseCurrency}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    echo $response;
} else {
    http_response_code($httpCode);
    echo json_encode([
        'result' => 'error',
        'error-type' => 'api-request-failed',
        'message' => 'Gagal mengambil data dari penyedia kurs.'
    ]);
}
?>