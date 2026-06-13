<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../api/backgrounds-lib.php';

$uploadDirFs = __DIR__ . '/../assets/images/backgrounds/';
$uploadDirUrl = '/abundance-alchemy/assets/images/backgrounds/';

if (!is_dir($uploadDirFs)) {
    mkdir($uploadDirFs, 0755, true);
}

$sectionSlots = aa_background_section_slots();
$globalSlots = aa_background_global_slots();
$screenSlots = aa_background_screen_slots();
$screenFallbackSection = aa_background_screen_fallback_sections();
$slots = aa_background_slots();
$schemaErrors = aa_ensure_background_schema($pdo);
$schemaStatus = aa_background_schema_status($pdo);
$current = aa_fetch_backgrounds($pdo);
$msg = '';
$msgType = 'info';

function aa_admin_background_e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function aa_admin_background_upload(array $file, string $slot, string $uploadDirFs, string $uploadDirUrl): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return ['ok' => false, 'message' => 'Please choose an image to upload.'];
    }
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return ['ok' => false, 'message' => 'Image upload failed before it reached the server.'];
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    $mime = null;
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
    } elseif (function_exists('mime_content_type')) {
        $mime = mime_content_type($file['tmp_name']);
    }

    if ($mime === null || !in_array($mime, $allowedTypes, true)) {
        return ['ok' => false, 'message' => 'Invalid image type. Use JPG, PNG, or WEBP.'];
    }

    $extensionByMime = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    $safeBase = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo((string)$file['name'], PATHINFO_FILENAME));
    $fileName = $slot . '_' . time() . '_' . ($safeBase ?: 'background') . '.' . $extensionByMime[$mime];
    $targetFs = rtrim($uploadDirFs, '/') . '/' . $fileName;
    $targetUrl = rtrim($uploadDirUrl, '/') . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetFs)) {
        return ['ok' => false, 'message' => 'Failed to save uploaded file.'];
    }

    return ['ok' => true, 'url' => $targetUrl];
}

function aa_admin_background_entry(array $current, string $slot): array
{
    return $current[$slot] ?? [
        'mode' => 'inherit',
        'image_url' => '',
        'color_value' => '',
        'creator_name' => '',
    ];
}

function aa_admin_render_background_cards(
    array $groupSlots,
    array $current,
    array $allSlots,
    array $screenFallbackSection,
    bool $hasCreatorNameColumn,
    string $groupType
): void {
    foreach ($groupSlots as $key => $label):
        $entry = aa_admin_background_entry($current, (string)$key);
        $mode = (string)($entry['mode'] ?? 'inherit');
        $imageUrl = (string)($entry['image_url'] ?? '');
        $colorValue = (string)($entry['color_value'] ?? '');
        $creatorName = (string)($entry['creator_name'] ?? '');
        $inherits = $screenFallbackSection[$key] ?? '';
        $inheritsLabel = $inherits !== '' ? ($allSlots[$inherits] ?? $inherits) : '';
        ?>
        <div class="col-md-6 col-xl-4">
            <div class="card slot-card">
                <div class="card-body">
                    <div class="slot-header">
                        <h5 class="slot-title"><?= aa_admin_background_e((string)$label) ?></h5>
                        <span class="slot-key"><?= aa_admin_background_e((string)$key) ?></span>
                    </div>

                    <?php if ($groupType === 'section'): ?>
                        <div class="slot-meta">Used when a screen-specific background inherits this section.</div>
                    <?php elseif ($groupType === 'global'): ?>
                        <div class="slot-meta">Final app-wide fallback after screen and section inheritance.</div>
                    <?php elseif ($inheritsLabel !== ''): ?>
                        <div class="slot-meta">
                            Inherits <strong><?= aa_admin_background_e((string)$inheritsLabel) ?></strong> when set to inherit.
                        </div>
                    <?php endif; ?>

                    <div class="mode-summary mode-summary-<?= aa_admin_background_e($mode) ?>">
                        <strong><?= aa_admin_background_e(ucfirst($mode)) ?></strong>
                        <?php if ($mode === 'image' && $imageUrl !== ''): ?>
                            <span>Image override is active.</span>
                        <?php elseif ($mode === 'color' && $colorValue !== ''): ?>
                            <span>Solid color <?= aa_admin_background_e($colorValue) ?> is active.</span>
                        <?php elseif ($mode === 'none'): ?>
                            <span>Fallback stops here and shows the base tone.</span>
                        <?php else: ?>
                            <span>Continues to the next fallback candidate.</span>
                        <?php endif; ?>
                    </div>

                    <?php if ($mode === 'image' && $imageUrl !== ''): ?>
                        <div class="mb-3">
                            <img src="<?= aa_admin_background_e($imageUrl) ?>"
                                 alt="<?= aa_admin_background_e((string)$label) ?> background"
                                 class="bg-thumb">
                        </div>
                        <?php if ($creatorName !== ''): ?>
                            <p class="small text-muted mb-3">Creator: <?= aa_admin_background_e($creatorName) ?></p>
                        <?php endif; ?>
                    <?php elseif ($mode === 'color' && $colorValue !== ''): ?>
                        <div class="color-thumb mb-3" style="background: <?= aa_admin_background_e($colorValue) ?>;"></div>
                    <?php else: ?>
                        <p class="empty-state">No image or color preview for this mode.</p>
                    <?php endif; ?>

                    <form method="post" enctype="multipart/form-data" class="upload-form">
                        <?php if (function_exists('aa_csrf_field')) { aa_csrf_field(); } ?>
                        <input type="hidden" name="slot" value="<?= aa_admin_background_e((string)$key) ?>">

                        <div class="mb-2">
                            <label class="form-label">Mode</label>
                            <select name="background_mode" class="form-select form-select-sm">
                                <?php foreach (aa_background_modes() as $option): ?>
                                    <option value="<?= aa_admin_background_e($option) ?>" <?= $mode === $option ? 'selected' : '' ?>>
                                        <?= aa_admin_background_e(ucfirst($option)) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-text">
                                Inherit continues fallback. None stops fallback and shows the base tone.
                            </div>
                        </div>

                        <div class="mb-2">
                            <label class="form-label">Upload image</label>
                            <input type="file" name="image" class="form-control" accept="image/*">
                            <?php if ($imageUrl !== ''): ?>
                                <div class="form-text">Leave empty to keep the current image when mode is Image.</div>
                            <?php endif; ?>
                        </div>

                        <div class="mb-2">
                            <label class="form-label">Color</label>
                            <input
                                type="text"
                                name="color_value"
                                class="form-control"
                                maxlength="32"
                                placeholder="#111827"
                                value="<?= aa_admin_background_e($colorValue) ?>"
                            >
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Image creator (optional)</label>
                            <input
                                type="text"
                                name="creator_name"
                                class="form-control"
                                maxlength="255"
                                value="<?= aa_admin_background_e($creatorName) ?>"
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
    <?php
    endforeach;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (function_exists('aa_require_valid_csrf')) {
        aa_require_valid_csrf();
    }

    $slot = trim((string)($_POST['slot'] ?? ''));
    $mode = strtolower(trim((string)($_POST['background_mode'] ?? 'inherit')));
    $creatorName = substr(trim((string)($_POST['creator_name'] ?? '')), 0, 255);
    $colorValue = aa_normalize_background_color((string)($_POST['color_value'] ?? ''));

    try {
        if (!isset($slots[$slot])) {
            throw new InvalidArgumentException('Invalid slot selected.');
        }
        if (!in_array($mode, aa_background_modes(), true)) {
            throw new InvalidArgumentException('Invalid background mode selected.');
        }

        $existing = aa_admin_background_entry($current, $slot);
        $imageUrl = (string)($existing['image_url'] ?? '');

        if ($mode === 'image') {
            $file = $_FILES['image'] ?? ['error' => UPLOAD_ERR_NO_FILE];
            if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $upload = aa_admin_background_upload($file, $slot, $uploadDirFs, $uploadDirUrl);
                if (!$upload['ok']) {
                    throw new RuntimeException((string)$upload['message']);
                }
                $imageUrl = (string)$upload['url'];
            }
            if ($imageUrl === '') {
                throw new InvalidArgumentException('Image mode requires an uploaded image or an existing image.');
            }
        }

        if ($mode === 'color' && $colorValue === '') {
            throw new InvalidArgumentException('Color mode requires a valid hex color such as #111827.');
        }

        aa_save_background($pdo, $slot, $mode, $imageUrl, $colorValue, $creatorName);
        $current = aa_fetch_backgrounds($pdo);
        $schemaStatus = aa_background_schema_status($pdo);
        $msg = 'Background updated for ' . $slots[$slot] . '.';
        $msgType = 'success';
    } catch (Throwable $e) {
        $msg = $e->getMessage() ?: 'Background update failed.';
        $msgType = 'danger';
    }
}

$hasCreatorNameColumn = (bool)$schemaStatus['hasCreatorNameColumn'];
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
        .slot-card .card-body { padding: 14px; }
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
        .mode-summary {
            display: flex;
            flex-direction: column;
            gap: 2px;
            border-radius: 10px;
            border: 1px solid #dee2e6;
            background: #f8f9fa;
            color: #495057;
            font-size: 0.78rem;
            padding: 8px 10px;
            margin-bottom: 10px;
        }
        .mode-summary-image {
            border-color: #bfdbfe;
            background: #eff6ff;
            color: #1e3a8a;
        }
        .mode-summary-color {
            border-color: #bbf7d0;
            background: #f0fdf4;
            color: #14532d;
        }
        .mode-summary-none {
            border-color: #fecaca;
            background: #fef2f2;
            color: #7f1d1d;
        }
        .bg-thumb,
        .color-thumb {
            width: 100%;
            height: 120px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .bg-thumb { object-fit: cover; }
        .color-thumb {
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
        }
        .upload-form .form-label {
            font-size: 0.78rem;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .upload-form .form-control,
        .upload-form .form-select,
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
            Resolve order is: <strong>Screen</strong> -> <strong>Section</strong> -> <strong>HOME</strong>.
            <strong>Inherit</strong> continues that chain. <strong>None</strong> stops the chain and shows the base tone.
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
                <div class="size-badge">Mode Notes</div>
                <h3>Choose Intentionally</h3>
                <div class="text-muted small">Image and color stop fallback. Inherit continues. None is an explicit blank override.</div>
            </div>
        </div>
    </div>

    <?php if ($msg): ?>
        <div class="alert alert-<?= aa_admin_background_e($msgType) ?>"><?= aa_admin_background_e($msg) ?></div>
    <?php endif; ?>

    <?php if (!empty($schemaErrors)): ?>
        <div class="alert alert-warning">
            <strong>Background Schema Update Needed:</strong>
            <div class="small mt-1"><?= aa_admin_background_e(implode(' ', $schemaErrors)) ?></div>
            <div class="small mt-2">Recommended SQL:</div>
            <pre class="mb-0"><code>ALTER TABLE backgrounds MODIFY slot VARCHAR(64) NOT NULL;
ALTER TABLE backgrounds ADD COLUMN background_mode VARCHAR(16) NOT NULL DEFAULT 'image' AFTER slot;
ALTER TABLE backgrounds ADD COLUMN color_value VARCHAR(32) NULL AFTER image_url;
ALTER TABLE backgrounds ADD COLUMN creator_name VARCHAR(255) NULL AFTER image_url;</code></pre>
        </div>
    <?php endif; ?>

    <?php if (!empty($schemaStatus['missingSlotValues'])): ?>
        <div class="alert alert-warning">
            <strong>Slot Schema Update Needed:</strong>
            <div class="small mt-1">
                The <code>backgrounds.slot</code> column currently does not allow:
                <code><?= aa_admin_background_e(implode(', ', $schemaStatus['missingSlotValues'])) ?></code>
            </div>
            <div class="small mt-2">Recommended SQL:</div>
            <pre class="mb-0"><code>ALTER TABLE backgrounds MODIFY slot VARCHAR(64) NOT NULL;</code></pre>
        </div>
    <?php endif; ?>

    <div class="section-header mt-4">
        <h2 class="h5 mb-0">1) Section Defaults</h2>
        <p class="text-muted small mb-0">Set one fallback for an entire app section.</p>
    </div>
    <div class="row g-3">
        <?php aa_admin_render_background_cards($sectionSlots, $current, $slots, $screenFallbackSection, $hasCreatorNameColumn, 'section'); ?>
    </div>

    <div class="section-header mt-4">
        <h2 class="h5 mb-0">2) Global Fallback</h2>
        <p class="text-muted small mb-0">Used only when neither screen nor section stops the chain.</p>
    </div>
    <div class="row g-3">
        <?php aa_admin_render_background_cards($globalSlots, $current, $slots, $screenFallbackSection, $hasCreatorNameColumn, 'global'); ?>
    </div>

    <div class="section-header mt-4">
        <h2 class="h5 mb-0">3) Screen Overrides</h2>
        <p class="text-muted small mb-0">Use screen rows only when a screen needs its own image, color, or blank override.</p>
    </div>
    <div class="row g-3">
        <?php aa_admin_render_background_cards($screenSlots, $current, $slots, $screenFallbackSection, $hasCreatorNameColumn, 'screen'); ?>
    </div>
</div>
</body>
</html>
