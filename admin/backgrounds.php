<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

// Ensure upload directory exists
$uploadDirFs  = __DIR__ . '/../assets/images/backgrounds/';
$uploadDirUrl = '/abundance-alchemy/assets/images/backgrounds/';

if (!is_dir($uploadDirFs)) {
    mkdir($uploadDirFs, 0755, true);
}

// Section defaults: used when a screen override is not set.
$sectionSlots = [
    'SECTION_ENTRY'        => 'Section Default: Entry Flow (Splash/Auth/Onboarding)',
    'SECTION_CORE'         => 'Section Default: Core App (Dashboard/Library/Settings/Profile/Stats)',
    'SECTION_AFFIRM_IAM'   => 'Section Default: Morning "I Am" Flow',
    'SECTION_AFFIRM_ILOVE' => 'Section Default: Evening "I Love" Flow',
    'SECTION_MEDITATION'   => 'Section Default: Meditation Flow',
    'SECTION_PRAYER'       => 'Section Default: Prayer (Omba) Flow',
];

// Global fallback used if no screen or section background exists.
$globalSlots = [
    'HOME' => 'Global Fallback (App Wide)',
];

// Screen overrides: these win over section defaults when assigned.
$screenSlots = [
    'PRE_SPLASH'           => 'Pre-Splash',
    'SPLASH'               => 'Splash Intro',
    'SPLASH_WELCOME'       => 'Splash Welcome (welcome.mp3)',
    'WELCOME'              => 'Welcome',
    'NAMING_CEREMONY'      => 'Sacred Naming Ceremony',
    'AUTH'                 => 'Login / Register',
    'RETURN_PORTAL'        => 'Return Portal',
    'ONBOARDING'           => 'Onboarding',
    'TUTORIAL'             => 'Tutorial',
    'DASHBOARD'            => 'Dashboard',
    'LIBRARY'              => 'Library (Maktaba)',
    'IAM_SETUP'            => 'Morning "I Am" – Setup',
    'IAM_PRACTICE'         => 'Morning "I Am" – Practice',
    'ILOVE_SETUP'          => 'Evening "I Love" – Setup',
    'ILOVE_PRACTICE'       => 'Evening "I Love" – Practice',
    'MEDITATION_SETUP'     => 'Meditation – Setup',
    'MEDITATION_PRACTICE'  => 'Meditation – Session',
    'PRAYER_SETUP'         => 'Prayer (Omba) – Setup',
    'PRAYER_GUIDE'         => 'Prayer (Omba) – Guide',
    'PRAYER_SESSION'       => 'Prayer (Omba) – Session',
    'SETTINGS'             => 'Settings',
    'PROFILE'              => 'Profile',
    'STATS'                => 'Stats',
    'PROGRESS'             => 'Progress / Journey Overview',
];

$screenFallbackSection = [
    'PRE_SPLASH'          => 'SECTION_ENTRY',
    'SPLASH'              => 'SECTION_ENTRY',
    'SPLASH_WELCOME'      => 'SECTION_ENTRY',
    'WELCOME'             => 'SECTION_ENTRY',
    'NAMING_CEREMONY'     => 'SECTION_ENTRY',
    'AUTH'                => 'SECTION_ENTRY',
    'RETURN_PORTAL'       => 'SECTION_ENTRY',
    'ONBOARDING'          => 'SECTION_ENTRY',
    'TUTORIAL'            => 'SECTION_ENTRY',
    'DASHBOARD'           => 'SECTION_CORE',
    'LIBRARY'             => 'SECTION_CORE',
    'SETTINGS'            => 'SECTION_CORE',
    'PROFILE'             => 'SECTION_CORE',
    'STATS'               => 'SECTION_CORE',
    'PROGRESS'            => 'SECTION_CORE',
    'IAM_SETUP'           => 'SECTION_AFFIRM_IAM',
    'IAM_PRACTICE'        => 'SECTION_AFFIRM_IAM',
    'ILOVE_SETUP'         => 'SECTION_AFFIRM_ILOVE',
    'ILOVE_PRACTICE'      => 'SECTION_AFFIRM_ILOVE',
    'MEDITATION_SETUP'    => 'SECTION_MEDITATION',
    'MEDITATION_PRACTICE' => 'SECTION_MEDITATION',
    'PRAYER_SETUP'        => 'SECTION_PRAYER',
    'PRAYER_GUIDE'        => 'SECTION_PRAYER',
    'PRAYER_SESSION'      => 'SECTION_PRAYER',
];

$slots = $sectionSlots + $globalSlots + $screenSlots;

$msg = '';
$slotType = '';
$enumValues = [];
$missingSlotValues = [];
$hasCreatorNameColumn = false;

try {
    $colStmt = $pdo->query("SHOW COLUMNS FROM backgrounds LIKE 'slot'");
    $slotColumn = $colStmt ? $colStmt->fetch(PDO::FETCH_ASSOC) : null;
    if ($slotColumn && isset($slotColumn['Type'])) {
        $slotType = (string)$slotColumn['Type'];
        if (stripos($slotType, 'enum(') === 0) {
            if (preg_match_all("/'([^']+)'/", $slotType, $matches)) {
                $enumValues = $matches[1] ?? [];
            }
            foreach (array_keys($slots) as $slotKey) {
                if (!in_array($slotKey, $enumValues, true)) {
                    $missingSlotValues[] = $slotKey;
                }
            }
        }
    }

    $creatorColStmt = $pdo->query("SHOW COLUMNS FROM backgrounds LIKE 'creator_name'");
    $hasCreatorNameColumn = $creatorColStmt ? (bool)$creatorColStmt->fetch(PDO::FETCH_ASSOC) : false;
} catch (Throwable $e) {
    // Non-fatal: admin page should still render.
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (function_exists('aa_require_valid_csrf')) {
        aa_require_valid_csrf();
    }

    $slot = $_POST['slot'] ?? '';
    $creatorName = trim((string)($_POST['creator_name'] ?? ''));
    if (strlen($creatorName) > 255) {
        $creatorName = substr($creatorName, 0, 255);
    }

    if (!isset($slots[$slot])) {
        $msg = 'Invalid slot selected.';
    } elseif (!empty($missingSlotValues) && in_array($slot, $missingSlotValues, true)) {
        $msg = 'Database schema for backgrounds.slot does not allow this slot yet. Update the slot column schema first.';
    } elseif (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $msg = 'Please choose an image to upload.';
    } else {
        try {
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
                    if ($hasCreatorNameColumn) {
                        $stmt = $pdo->prepare("
                            INSERT INTO backgrounds (slot, image_url, creator_name, is_active)
                            VALUES (:slot, :image_url, :creator_name, 1)
                            ON DUPLICATE KEY UPDATE
                                image_url = VALUES(image_url),
                                creator_name = VALUES(creator_name),
                                is_active = 1
                        ");
                        $stmt->execute([
                            ':slot'         => $slot,
                            ':image_url'    => $targetUrl,
                            ':creator_name' => $creatorName,
                        ]);
                    } else {
                        $stmt = $pdo->prepare("
                            INSERT INTO backgrounds (slot, image_url, is_active)
                            VALUES (:slot, :image_url, 1)
                            ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), is_active = 1
                        ");
                        $stmt->execute([
                            ':slot'      => $slot,
                            ':image_url' => $targetUrl,
                        ]);
                    }

                    $msg = 'Background updated for ' . $slots[$slot] . '.';
                } else {
                    $msg = 'Failed to save uploaded file.';
                }
            }
        } catch (Throwable $e) {
            $msg = 'Upload failed. Check backgrounds table slot schema and server write permissions.';
        }
    }
}

// Fetch current backgrounds
$stmt = $pdo->query(
    $hasCreatorNameColumn
        ? "SELECT slot, image_url, creator_name FROM backgrounds WHERE is_active = 1"
        : "SELECT slot, image_url FROM backgrounds WHERE is_active = 1"
);
$current = [];
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $current[$row['slot']] = [
        'image_url' => (string)($row['image_url'] ?? ''),
        'creator_name' => $hasCreatorNameColumn ? (string)($row['creator_name'] ?? '') : '',
    ];
}

$getSlotImage = static function(array $items, string $slot): string {
    return (string)($items[$slot]['image_url'] ?? '');
};
$getSlotCreator = static function(array $items, string $slot): string {
    return (string)($items[$slot]['creator_name'] ?? '');
};
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
        .page-intro {
            border: 1px solid #e9ecef;
            border-radius: 16px;
            background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
            padding: 18px 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .guide-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
        }
        .guide-card {
            border: 1px solid #e9ecef;
            border-radius: 14px;
            background: #fff;
            padding: 12px 14px;
        }
        .guide-card h3 {
            font-size: 0.9rem;
            margin-bottom: 6px;
        }
        .guide-card .size-badge {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            background: #fff3cd;
            color: #7a5200;
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            padding: 4px 10px;
            margin-bottom: 8px;
        }
        .section-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 10px;
        }
        .slot-card {
            height: 100%;
            border-radius: 16px;
            border: 1px solid #e9ecef;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }
        .slot-card .card-body {
            padding: 14px;
        }
        .slot-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
        }
        .slot-title {
            font-size: 0.98rem;
            margin: 0;
        }
        .slot-key {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 2px 8px;
            font-size: 0.72rem;
            color: #495057;
        }
        .slot-meta {
            font-size: 0.78rem;
            color: #6c757d;
            margin-bottom: 10px;
        }
        .bg-thumb {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .upload-form .form-label {
            font-size: 0.78rem;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .upload-form .form-control,
        .upload-form .btn {
            font-size: 0.88rem;
        }
        .empty-state {
            font-size: 0.82rem;
            color: #6c757d;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
<?php include __DIR__ . '/header.php'; ?>

<div class="container mt-4">
    <h1 class="h4 mb-3">Backgrounds</h1>
    <div class="page-intro mb-4">
        <p class="text-muted mb-3">
            Resolve order is: <strong>Screen Image</strong> → <strong>Section Image</strong> → <strong>App Fallback Image (HOME)</strong>.
            Color and overlay styling are still handled in the app theme.
        </p>
        <div class="guide-grid">
            <div class="guide-card">
                <div class="size-badge">App Background</div>
                <h3>Best Size</h3>
                <div><strong>2160 x 3840</strong> px</div>
                <div class="text-muted small">Use this for global and section atmosphere images.</div>
            </div>
            <div class="guide-card">
                <div class="size-badge">Screen Background</div>
                <h3>Best Size</h3>
                <div><strong>1440 x 2560</strong> px</div>
                <div class="text-muted small">You can also use <strong>2160 x 3840</strong> if you want one master size.</div>
            </div>
            <div class="guide-card">
                <div class="size-badge">Composition Notes</div>
                <h3>Keep It Safe</h3>
                <div class="text-muted small">Keep important details centered, avoid text baked into the art, and expect edge crop on phones and desktop.</div>
            </div>
        </div>
    </div>

    <?php if ($msg): ?>
        <div class="alert alert-info"><?= htmlspecialchars($msg) ?></div>
    <?php endif; ?>
    <?php if (!empty($missingSlotValues)): ?>
        <div class="alert alert-warning">
            <strong>Slot Schema Update Needed:</strong>
            <div class="small mt-1">
                The <code>backgrounds.slot</code> column currently does not allow:
                <code><?= htmlspecialchars(implode(', ', $missingSlotValues)) ?></code>
            </div>
            <div class="small mt-2">Recommended SQL:</div>
            <pre class="mb-0"><code>ALTER TABLE backgrounds MODIFY slot VARCHAR(64) NOT NULL;</code></pre>
        </div>
    <?php endif; ?>
    <?php if (!$hasCreatorNameColumn): ?>
        <div class="alert alert-warning">
            <strong>Image Credit Schema Update Needed:</strong>
            <div class="small mt-1">Add a creator column so image credits can be saved per slot.</div>
            <div class="small mt-2">Recommended SQL:</div>
            <pre class="mb-0"><code>ALTER TABLE backgrounds ADD COLUMN creator_name VARCHAR(255) NULL AFTER image_url;</code></pre>
        </div>
    <?php endif; ?>

    <div class="section-header mt-4">
        <h2 class="h5 mb-0">1) Section Defaults</h2>
        <p class="text-muted small mb-0">Use these to set one background for an entire app section.</p>
    </div>
    <div class="row g-3">
        <?php foreach ($sectionSlots as $key => $label): ?>
            <?php
                $imageUrl = $getSlotImage($current, $key);
                $creatorName = $getSlotCreator($current, $key);
            ?>
            <div class="col-md-6 col-lg-4">
                <div class="card slot-card">
                    <div class="card-body">
                        <div class="slot-header">
                            <h5 class="slot-title"><?= htmlspecialchars($label) ?></h5>
                            <span class="slot-key"><?= htmlspecialchars($key) ?></span>
                        </div>
                        <div class="slot-meta">Used when a screen-specific background is not assigned.</div>

                        <?php if ($imageUrl !== ''): ?>
                            <div class="mb-3">
                                <img src="<?= htmlspecialchars($imageUrl) ?>"
                                     alt="<?= htmlspecialchars($label) ?> background"
                                     class="bg-thumb">
                            </div>
                            <?php if ($creatorName !== ''): ?>
                                <p class="small text-muted mb-3">Creator: <?= htmlspecialchars($creatorName) ?></p>
                            <?php endif; ?>
                        <?php else: ?>
                            <p class="empty-state">No background set yet.</p>
                        <?php endif; ?>

                        <form method="post" enctype="multipart/form-data" class="upload-form">
                            <?php if (function_exists('aa_csrf_field')) { aa_csrf_field(); } ?>
                            <input type="hidden" name="slot" value="<?= htmlspecialchars($key) ?>">
                            <div class="mb-2">
                                <label class="form-label">Upload new image</label>
                                <input type="file" name="image" class="form-control" accept="image/*" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image creator (optional)</label>
                                <input
                                    type="text"
                                    name="creator_name"
                                    class="form-control"
                                    maxlength="255"
                                    value="<?= htmlspecialchars($creatorName) ?>"
                                    <?= $hasCreatorNameColumn ? '' : 'disabled' ?>
                                >
                                <?php if (!$hasCreatorNameColumn): ?>
                                    <div class="form-text text-warning">Enable <code>creator_name</code> column to save credits.</div>
                                <?php endif; ?>
                            </div>
                            <button class="btn btn-primary btn-sm w-100">Save Background</button>
                        </form>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="section-header mt-4">
        <h2 class="h5 mb-0">2) Global Fallback</h2>
        <p class="text-muted small mb-0">Used only when neither screen nor section background is assigned.</p>
    </div>
    <div class="row g-3">
        <?php foreach ($globalSlots as $key => $label): ?>
            <?php
                $imageUrl = $getSlotImage($current, $key);
                $creatorName = $getSlotCreator($current, $key);
            ?>
            <div class="col-md-6 col-lg-4">
                <div class="card slot-card">
                    <div class="card-body">
                        <div class="slot-header">
                            <h5 class="slot-title"><?= htmlspecialchars($label) ?></h5>
                            <span class="slot-key"><?= htmlspecialchars($key) ?></span>
                        </div>

                        <?php if ($imageUrl !== ''): ?>
                            <div class="mb-3">
                                <img src="<?= htmlspecialchars($imageUrl) ?>"
                                     alt="<?= htmlspecialchars($label) ?> background"
                                     class="bg-thumb">
                            </div>
                            <?php if ($creatorName !== ''): ?>
                                <p class="small text-muted mb-3">Creator: <?= htmlspecialchars($creatorName) ?></p>
                            <?php endif; ?>
                        <?php else: ?>
                            <p class="empty-state">No background set yet.</p>
                        <?php endif; ?>

                        <form method="post" enctype="multipart/form-data" class="upload-form">
                            <?php if (function_exists('aa_csrf_field')) { aa_csrf_field(); } ?>
                            <input type="hidden" name="slot" value="<?= htmlspecialchars($key) ?>">
                            <div class="mb-2">
                                <label class="form-label">Upload new image</label>
                                <input type="file" name="image" class="form-control" accept="image/*" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image creator (optional)</label>
                                <input
                                    type="text"
                                    name="creator_name"
                                    class="form-control"
                                    maxlength="255"
                                    value="<?= htmlspecialchars($creatorName) ?>"
                                    <?= $hasCreatorNameColumn ? '' : 'disabled' ?>
                                >
                                <?php if (!$hasCreatorNameColumn): ?>
                                    <div class="form-text text-warning">Enable <code>creator_name</code> column to save credits.</div>
                                <?php endif; ?>
                            </div>
                            <button class="btn btn-primary btn-sm w-100">Save Background</button>
                        </form>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="section-header mt-4">
        <h2 class="h5 mb-0">3) Screen Overrides</h2>
        <p class="text-muted small mb-0">If empty, a screen inherits its section default and then HOME if needed.</p>
    </div>
    <div class="row g-3">
        <?php foreach ($screenSlots as $key => $label): ?>
            <?php
                $inherits = $screenFallbackSection[$key] ?? 'HOME';
                $inheritsLabel = $slots[$inherits] ?? $inherits;
                $imageUrl = $getSlotImage($current, $key);
                $creatorName = $getSlotCreator($current, $key);
            ?>
            <div class="col-md-6 col-xl-4">
                <div class="card slot-card">
                    <div class="card-body">
                        <div class="slot-header">
                            <h5 class="slot-title"><?= htmlspecialchars($label) ?></h5>
                            <span class="slot-key"><?= htmlspecialchars($key) ?></span>
                        </div>
                        <div class="slot-meta">
                            Inherits <strong><?= htmlspecialchars($inheritsLabel) ?></strong> when empty.
                        </div>

                        <?php if ($imageUrl !== ''): ?>
                            <div class="mb-3">
                                <img src="<?= htmlspecialchars($imageUrl) ?>"
                                     alt="<?= htmlspecialchars($label) ?> background"
                                     class="bg-thumb">
                            </div>
                            <?php if ($creatorName !== ''): ?>
                                <p class="small text-muted mb-3">Creator: <?= htmlspecialchars($creatorName) ?></p>
                            <?php endif; ?>
                        <?php else: ?>
                            <p class="empty-state">No override set yet.</p>
                        <?php endif; ?>

                        <form method="post" enctype="multipart/form-data" class="upload-form">
                            <?php if (function_exists('aa_csrf_field')) { aa_csrf_field(); } ?>
                            <input type="hidden" name="slot" value="<?= htmlspecialchars($key) ?>">
                            <div class="mb-2">
                                <label class="form-label">Upload new image</label>
                                <input type="file" name="image" class="form-control" accept="image/*" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image creator (optional)</label>
                                <input
                                    type="text"
                                    name="creator_name"
                                    class="form-control"
                                    maxlength="255"
                                    value="<?= htmlspecialchars($creatorName) ?>"
                                    <?= $hasCreatorNameColumn ? '' : 'disabled' ?>
                                >
                                <?php if (!$hasCreatorNameColumn): ?>
                                    <div class="form-text text-warning">Enable <code>creator_name</code> column to save credits.</div>
                                <?php endif; ?>
                            </div>
                            <button class="btn btn-primary btn-sm w-100">Save Background</button>
                        </form>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
</body>
</html>
