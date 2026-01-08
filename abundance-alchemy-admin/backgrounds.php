<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

// Ensure upload directory exists
$uploadDirFs  = __DIR__ . '/../assets/images/backgrounds/';
$uploadDirUrl = '/abundance-alchemy/assets/images/backgrounds/';

if (!is_dir($uploadDirFs)) {
    mkdir($uploadDirFs, 0755, true);
}

// Map DB slots to nice labels for admin UI
$slots = [
    'SPLASH'         => 'Splash Intro',
    'SPLASH_WELCOME' => 'Splash Welcome (welcome.mp3)',
    'AUTH'           => 'Login / Register',
    'HOME'           => 'Dashboard / Home',
    'WELCOME'             => 'Welcome',
    'IAM_SETUP'           => 'Morning "I Am" – Setup',
    'IAM_PRACTICE'        => 'Morning "I Am" – Practice',
    'ILOVE_SETUP'         => 'Evening "I Love" – Setup',
    'ILOVE_PRACTICE'      => 'Evening "I Love" – Practice',
    'MEDITATION_SETUP'    => 'Meditation – Setup',
    'MEDITATION_PRACTICE' => 'Meditation – Session',
    'SETTINGS'            => 'Settings Screen',
    'PROGRESS'            => 'Progress / Journey Overview',
];

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (function_exists('aa_require_valid_csrf')) {
        aa_require_valid_csrf();
    }

    $slot = $_POST['slot'] ?? '';
    if (!isset($slots[$slot])) {
        $msg = 'Invalid slot selected.';
    } elseif (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $msg = 'Please choose an image to upload.';
    } else {
        $file = $_FILES['image'];

        // Basic validation
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $mime = null;

        if (class_exists('finfo')) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime  = $finfo->file($file['tmp_name']);
        } elseif (function_exists('mime_content_type')) {
            $mime = mime_content_type($file['tmp_name']);
        }

        if ($mime === null || !in_array($mime, $allowedTypes, true)) {
            $msg = 'Invalid image type. Use JPG, PNG, or WEBP.';
        } else {
            $ext       = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $safeBase  = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
            $fileName  = $slot . '_' . time() . '_' . $safeBase . '.' . $ext;
            $targetFs  = $uploadDirFs . $fileName;
            $targetUrl = $uploadDirUrl . $fileName;

            if (move_uploaded_file($file['tmp_name'], $targetFs)) {
                // Insert or update this slot
                $stmt = $pdo->prepare("
                    INSERT INTO backgrounds (slot, image_url, is_active)
                    VALUES (:slot, :image_url, 1)
                    ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), is_active = 1
                ");
                $stmt->execute([
                    ':slot'      => $slot,
                    ':image_url' => $targetUrl,
                ]);

                $msg = 'Background updated for ' . $slots[$slot] . '.';
            } else {
                $msg = 'Failed to save uploaded file.';
            }
        }
    }
}

// Fetch current backgrounds
$stmt = $pdo->query("SELECT slot, image_url FROM backgrounds WHERE is_active = 1");
$current = [];
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $current[$row['slot']] = $row['image_url'];
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Backgrounds - Abundance Alchemy Admin</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          crossorigin="anonymous">
    <style>
        body { padding: 20px; }
        .bg-thumb {
            width: 180px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
    </style>
</head>
<body>
<?php include __DIR__ . '/header.php'; ?>

<div class="container mt-4">
    <h1 class="h4 mb-3">Screen Backgrounds</h1>
    <p class="text-muted mb-4">
        Upload and assign background images for different parts of the Abundance Alchemy app.
    </p>

    <?php if ($msg): ?>
        <div class="alert alert-info"><?= htmlspecialchars($msg) ?></div>
    <?php endif; ?>

    <div class="row">
        <?php foreach ($slots as $key => $label): ?>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title"><?= htmlspecialchars($label) ?></h5>
                        <p class="card-text">
                            Slot key: <code><?= htmlspecialchars($key) ?></code>
                        </p>

                        <?php if (!empty($current[$key])): ?>
                            <div class="mb-3">
                                <img src="<?= htmlspecialchars($current[$key]) ?>"
                                     alt="<?= htmlspecialchars($label) ?> background"
                                     class="bg-thumb">
                            </div>
                        <?php else: ?>
                            <p class="text-muted">No background set yet.</p>
                        <?php endif; ?>

                        <form method="post" enctype="multipart/form-data">
                            <?php if (function_exists('aa_csrf_field')) { aa_csrf_field(); } ?>
                            <input type="hidden" name="slot" value="<?= htmlspecialchars($key) ?>">
                            <div class="mb-3">
                                <label class="form-label">Upload new image</label>
                                <input type="file" name="image" class="form-control" accept="image/*" required>
                            </div>
                            <button class="btn btn-primary btn-sm">Save Background</button>
                        </form>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
</body>
</html>