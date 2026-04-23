<?php
/**
 * iFastX Professional Mailer Utility
 * Handles branded HTML emails for the GST Billing Platform
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['to']) || !isset($input['subject']) || !isset($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$to = $input['to'];
$subject = $input['subject'];
$content = $input['message'];

// Configuration for official emails
$type = isset($input['type']) ? $input['type'] : 'support'; // 'support' or 'hr'
$fromEmail = ($type === 'hr') ? 'hr@ifastx.in' : 'support@ifastx.in';
$fromName = ($type === 'hr') ? 'iFastX HR Team' : 'iFastX Support';

// Professional HTML Template
$message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .header { background-color: #0f172a; padding: 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: -1px; }
        .logo span { color: #2563eb; }
        .content { padding: 40px; background-color: #ffffff; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .brand-sub { display: block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: bold; font-style: normal; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>iFast<span>X</span>
                <span class='brand-sub'>GST Billing Platform</span>
            </div>
        </div>
        <div class='content'>
            $content
        </div>
        <div class='footer'>
            <p>&copy; " . date('Y') . " iFastX. All rights reserved.</p>
            <p>Support: support@ifastx.in | HR: hr@ifastx.in</p>
            <p><a href='https://ifastx.in' style='color: #2563eb; text-decoration: none;'>www.ifastx.in</a></p>
        </div>
    </div>
</body>
</html>
";

$headers = [
    'MIME-Version' => '1.0',
    'Content-type' => 'text/html; charset=utf-8',
    'From' => "$fromName <$fromEmail>",
    'Reply-To' => $fromEmail,
    'X-Mailer' => 'PHP/' . phpversion()
];

$headerString = '';
foreach ($headers as $key => $value) {
    $headerString .= "$key: $value\r\n";
}

if (mail($to, $subject, $message, $headerString)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send email']);
}
?>
创新创业
