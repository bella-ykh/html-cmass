<?php
// download.php - 비디오 다운로드 프록시

// CORS 헤더 설정
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: *');

// 파라미터 받기
$videoUrl = $_GET['url'] ?? '';
$filename = $_GET['filename'] ?? 'video.mp4';

if (empty($videoUrl)) {
    http_response_code(400);
    die('URL이 필요합니다.');
}

// 파일명 안전하게 처리
$filename = preg_replace('/[^a-zA-Z0-9가-힣\.\-_\s]/', '', $filename);
if (!str_ends_with($filename, '.mp4')) {
    $filename .= '.mp4';
}

// 다운로드 헤더 설정 (이미지처럼 브라우저 다운로드 창 뜨게 함)
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Transfer-Encoding: binary');
header('Cache-Control: no-cache, must-revalidate');

// 파일 스트림 전송
$context = stream_context_create([
    'http' => [
        'timeout' => 300,
        'method' => 'GET'
    ]
]);

// 네이버 클라우드에서 파일을 가져와서 브라우저로 전송
$fileStream = fopen($videoUrl, 'rb', false, $context);

if ($fileStream) {
    // 청크 단위로 전송 (메모리 효율적)
    while (!feof($fileStream)) {
        echo fread($fileStream, 8192);
        flush();
    }
    fclose($fileStream);
} else {
    http_response_code(404);
    echo '파일을 찾을 수 없습니다.';
}
?>
