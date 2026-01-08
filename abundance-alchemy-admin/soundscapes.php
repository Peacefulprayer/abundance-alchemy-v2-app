<?php
// /admin/soundscapes.php
session_start();
require_once '../db.php';

// Use the same admin check as other admin pages
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit();
}

$success = $success ?? null;
$error   = $error ?? null;
$editTrack = null;

// Handle Upload NEW track
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['audio_file']) && empty($_POST['edit_id'])) {
    $name            = trim($_POST['name'] ?? '');
    $category        = trim($_POST['category'] ?? '');
    $usage_purpose   = trim($_POST['usage_purpose'] ?? 'meditation');
    $duration_seconds = isset($_POST['duration_seconds']) ? (int)$_POST['duration_seconds'] : null;
    $bpm             = isset($_POST['bpm']) ? (int)$_POST['bpm'] : null;
    $energy_level    = trim($_POST['energy_level'] ?? 'medium');
    $is_loopable     = isset($_POST['is_loopable']) ? 1 : 0;
    $is_public       = isset($_POST['is_public']) ? 1 : 1;
    $tags            = trim($_POST['tags'] ?? '');
    $mood            = trim($_POST['mood'] ?? '');
    
    $creator_name    = trim($_POST['creator_name'] ?? '');
    $creator_website = trim($_POST['creator_website'] ?? '');
    $source_name     = trim($_POST['source_name'] ?? '');
    $source_url      = trim($_POST['source_url'] ?? '');
    $license_type    = trim($_POST['license_type'] ?? '');
    $license_notes   = trim($_POST['license_notes'] ?? '');
    
    $targetDir = "../assets/audio/";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    
    $fileName       = time() . '_' . bin2hex(random_bytes(4)) . '_' . basename($_FILES["audio_file"]["name"]);
    $targetFilePath = $targetDir . $fileName;
    
    if (move_uploaded_file($_FILES["audio_file"]["tmp_name"], $targetFilePath)) {
        // Save to DB (use relative URL based on your site structure)
        $publicUrl = "/abundance-alchemy/assets/audio/" . $fileName;

        $stmt = $pdo->prepare("
            INSERT INTO soundscapes 
                (name, url, category, usage_purpose, duration_seconds, bpm, 
                 energy_level, is_loopable, tags, mood, is_public,
                 creator_name, creator_website, source_name, source_url, 
                 license_type, license_notes, is_active) 
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");

        $stmt->execute([
            $name,
            $publicUrl,
            $category,
            $usage_purpose,
            $duration_seconds,
            $bpm,
            $energy_level,
            $is_loopable,
            $tags,
            $mood,
            $is_public,
            $creator_name ?: null,
            $creator_website ?: null,
            $source_name ?: null,
            $source_url ?: null,
            $license_type ?: null,
            $license_notes ?: null
        ]);

        $success = "Track uploaded successfully with all metadata!";
    } else {
        $error = "File upload failed.";
    }
}

// Handle UPDATE (edit existing track metadata)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_id']) && empty($_FILES['audio_file']['name'])) {
    $editId          = (int) ($_POST['edit_id'] ?? 0);
    $name            = trim($_POST['name'] ?? '');
    $category        = trim($_POST['category'] ?? '');
    $usage_purpose   = trim($_POST['usage_purpose'] ?? 'meditation');
    $duration_seconds = isset($_POST['duration_seconds']) ? (int)$_POST['duration_seconds'] : null;
    $bpm             = isset($_POST['bpm']) ? (int)$_POST['bpm'] : null;
    $energy_level    = trim($_POST['energy_level'] ?? 'medium');
    $is_loopable     = isset($_POST['is_loopable']) ? 1 : 0;
    $is_public       = isset($_POST['is_public']) ? 1 : 1;
    $tags            = trim($_POST['tags'] ?? '');
    $mood            = trim($_POST['mood'] ?? '');
    
    $creator_name    = trim($_POST['creator_name'] ?? '');
    $creator_website = trim($_POST['creator_website'] ?? '');
    $source_name     = trim($_POST['source_name'] ?? '');
    $source_url      = trim($_POST['source_url'] ?? '');
    $license_type    = trim($_POST['license_type'] ?? '');
    $license_notes   = trim($_POST['license_notes'] ?? '');

    if ($editId > 0) {
        $stmt = $pdo->prepare("
            UPDATE soundscapes
               SET name = ?,
                   category = ?,
                   usage_purpose = ?,
                   duration_seconds = ?,
                   bpm = ?,
                   energy_level = ?,
                   is_loopable = ?,
                   is_public = ?,
                   tags = ?,
                   mood = ?,
                   creator_name = ?,
                   creator_website = ?,
                   source_name = ?,
                   source_url = ?,
                   license_type = ?,
                   license_notes = ?
             WHERE id = ?
        ");
        $stmt->execute([
            $name,
            $category,
            $usage_purpose,
            $duration_seconds,
            $bpm,
            $energy_level,
            $is_loopable,
            $is_public,
            $tags,
            $mood,
            $creator_name ?: null,
            $creator_website ?: null,
            $source_name ?: null,
            $source_url ?: null,
            $license_type ?: null,
            $license_notes ?: null,
            $editId
        ]);

        $success = "Track details updated successfully!";
    } else {
        $error = "Invalid track selected for update.";
    }
}

// Handle Delete
if (isset($_GET['delete'])) {
    $id = (int) $_GET['delete'];
    $stmt = $pdo->prepare("DELETE FROM soundscapes WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: soundscapes.php");
    exit();
}

// Toggle Active/Inactive
if (isset($_GET['toggle'])) {
    $id = (int) $_GET['toggle'];
    $stmt = $pdo->prepare("UPDATE soundscapes SET is_active = NOT is_active WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: soundscapes.php");
    exit();
}

// Toggle Public/Private
if (isset($_GET['toggle_public'])) {
    $id = (int) $_GET['toggle_public'];
    $stmt = $pdo->prepare("UPDATE soundscapes SET is_public = NOT is_public WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: soundscapes.php");
    exit();
}

// Load track for editing (if any)
if (isset($_GET['edit'])) {
    $editId = (int) $_GET['edit'];
    $stmt = $pdo->prepare("SELECT * FROM soundscapes WHERE id = ?");
    $stmt->execute([$editId]);
    $editTrack = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$editTrack) {
        $error = "Track not found for editing.";
    }
}

// Fetch all tracks
$tracks = $pdo->query("
    SELECT * FROM soundscapes 
    ORDER BY 
        is_active DESC,
        is_public DESC,
        created_at DESC
")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Soundscapes - Abundance Alchemy</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .metadata-badge {
            font-size: 0.75rem;
            margin-right: 4px;
            margin-bottom: 4px;
        }
        .duration-badge {
            background-color: #6f42c1;
            color: white;
        }
        .bpm-badge {
            background-color: #20c997;
            color: white;
        }
        .energy-low { background-color: #0dcaf0; color: white; }
        .energy-medium { background-color: #198754; color: white; }
        .energy-high { background-color: #fd7e14; color: white; }
        .purpose-badge { background-color: #6c757d; color: white; }
        .audio-player-small {
            height: 30px;
            width: 180px;
        }
        .table-hover tbody tr:hover {
            background-color: rgba(0, 123, 255, 0.05);
        }
    </style>
</head>
<body class="bg-light">
    <?php include 'header.php'; ?>
    <div class="container py-5">
        <h2>Manage Soundscapes</h2>
        <p class="text-muted">Upload and manage audio tracks for the Abundance Alchemy app</p>
        
        <!-- Upload Form -->
        <div class="card p-4 mb-5 shadow-sm">
            <h5><?= isset($editTrack) ? 'Edit Track: ' . htmlspecialchars($editTrack['name']) : 'Upload New Track' ?></h5>
            <?php if(isset($success)) echo "<div class='alert alert-success'>".htmlspecialchars($success)."</div>"; ?>
            <?php if(isset($error)) echo "<div class='alert alert-danger'>".htmlspecialchars($error)."</div>"; ?>
            
            <form method="POST" enctype="multipart/form-data">
                <?php if(isset($editTrack)): ?>
                    <input type="hidden" name="edit_id" value="<?= (int)$editTrack['id'] ?>">
                <?php endif; ?>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6>Basic Info</h6>
                        <div class="mb-3">
                            <label class="form-label">Track Name *</label>
                            <input type="text" name="name" class="form-control" required
                                   value="<?= isset($editTrack) ? htmlspecialchars($editTrack['name']) : '' ?>">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Category *</label>
                            <select name="category" class="form-control" required>
                                <option value="General" <?= (isset($editTrack) && $editTrack['category'] === 'General') ? 'selected' : '' ?>>General</option>
                                <option value="Meditation" <?= (isset($editTrack) && $editTrack['category'] === 'Meditation') ? 'selected' : '' ?>>Meditation</option>
                                <option value="MORNING_IAM" <?= (isset($editTrack) && $editTrack['category'] === 'MORNING_IAM') ? 'selected' : '' ?>>Morning I AM</option>
                                <option value="EVENING_ILOVE" <?= (isset($editTrack) && $editTrack['category'] === 'EVENING_ILOVE') ? 'selected' : '' ?>>Evening I LOVE</option>
                                <option value="Music" <?= (isset($editTrack) && $editTrack['category'] === 'Music') ? 'selected' : '' ?>>Music</option>
                                <option value="Ambience" <?= (isset($editTrack) && $editTrack['category'] === 'Ambience') ? 'selected' : '' ?>>Ambience</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Usage Purpose *</label>
                            <select name="usage_purpose" class="form-control" required>
                                <option value="ambience" <?= (isset($editTrack) && $editTrack['usage_purpose'] === 'ambience') ? 'selected' : '' ?>>Background Ambience</option>
                                <option value="meditation" <?= (isset($editTrack) && ($editTrack['usage_purpose'] === 'meditation' || !isset($editTrack))) ? 'selected' : '' ?>>Meditation</option>
                                <option value="iam_practice" <?= (isset($editTrack) && $editTrack['usage_purpose'] === 'iam_practice') ? 'selected' : '' ?>>I AM Practice</option>
                                <option value="ilove_practice" <?= (isset($editTrack) && $editTrack['usage_purpose'] === 'ilove_practice') ? 'selected' : '' ?>>I LOVE Practice</option>
                                <option value="button" <?= (isset($editTrack) && $editTrack['usage_purpose'] === 'button') ? 'selected' : '' ?>>Button Sound</option>
                                <option value="voice" <?= (isset($editTrack) && $editTrack['usage_purpose'] === 'voice') ? 'selected' : '' ?>>Voice Message</option>
                                <option value="transition" <?= (isset($editTrack) && $editTrack['usage_purpose'] === 'transition') ? 'selected' : '' ?>>Transition Sound</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <h6>Audio Properties</h6>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Duration (seconds)</label>
                                <input type="number" name="duration_seconds" class="form-control" min="1"
                                       value="<?= isset($editTrack) ? htmlspecialchars($editTrack['duration_seconds'] ?? '') : '' ?>"
                                       placeholder="e.g., 120 for 2 minutes">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">BPM (Beats Per Minute)</label>
                                <input type="number" name="bpm" class="form-control" min="1" max="240"
                                       value="<?= isset($editTrack) ? htmlspecialchars($editTrack['bpm'] ?? '') : '' ?>"
                                       placeholder="e.g., 60, 120">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Energy Level</label>
                            <select name="energy_level" class="form-control">
                                <option value="low" <?= (isset($editTrack) && $editTrack['energy_level'] === 'low') ? 'selected' : '' ?>>Low (relaxing, calming)</option>
                                <option value="medium" <?= (isset($editTrack) && ($editTrack['energy_level'] === 'medium' || !isset($editTrack))) ? 'selected' : '' ?>>Medium (balanced, focused)</option>
                                <option value="high" <?= (isset($editTrack) && $editTrack['energy_level'] === 'high') ? 'selected' : '' ?>>High (energizing, uplifting)</option>
                            </select>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tags (comma separated)</label>
                                <input type="text" name="tags" class="form-control"
                                       value="<?= isset($editTrack) ? htmlspecialchars($editTrack['tags'] ?? '') : '' ?>"
                                       placeholder="calm, nature, piano, instrumental">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Mood</label>
                                <input type="text" name="mood" class="form-control"
                                       value="<?= isset($editTrack) ? htmlspecialchars($editTrack['mood'] ?? '') : '' ?>"
                                       placeholder="peaceful, energizing, soothing">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="is_loopable" value="1" 
                                       id="is_loopable" <?= (isset($editTrack) && ($editTrack['is_loopable'] == 1 || !isset($editTrack))) ? 'checked' : '' ?>>
                                <label class="form-check-label" for="is_loopable">
                                    Can be looped (for background/ambience)
                                </label>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="is_public" value="1" 
                                       id="is_public" <?= (isset($editTrack) && ($editTrack['is_public'] == 1 || !isset($editTrack))) ? 'checked' : '' ?>>
                                <label class="form-check-label" for="is_public">
                                    Make public (visible to all users)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <hr>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6>Creator Information</h6>
                        <div class="mb-3">
                            <label class="form-label">Artist / Creator</label>
                            <input type="text" name="creator_name" class="form-control"
                                   value="<?= isset($editTrack) ? htmlspecialchars($editTrack['creator_name'] ?? '') : '' ?>"
                                   placeholder="Name of the artist / creator">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Creator Website</label>
                            <input type="url" name="creator_website" class="form-control"
                                   value="<?= isset($editTrack) ? htmlspecialchars($editTrack['creator_website'] ?? '') : '' ?>"
                                   placeholder="https://example.com">
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <h6>Source & License</h6>
                        <div class="mb-3">
                            <label class="form-label">Downloaded From (Platform / Source)</label>
                            <input type="text" name="source_name" class="form-control"
                                   value="<?= isset($editTrack) ? htmlspecialchars($editTrack['source_name'] ?? '') : '' ?>"
                                   placeholder="e.g., Pixabay, Artlist, YouTube Audio Library">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Source URL</label>
                            <input type="url" name="source_url" class="form-control"
                                   value="<?= isset($editTrack) ? htmlspecialchars($editTrack['source_url'] ?? '') : '' ?>"
                                   placeholder="Direct link to the track/source page">
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">License Type</label>
                        <input type="text" name="license_type" class="form-control"
                               value="<?= isset($editTrack) ? htmlspecialchars($editTrack['license_type'] ?? '') : '' ?>"
                               placeholder="e.g., CC0, CC-BY 4.0, Royalty-Free, Paid License">
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label">License Notes / Attribution</label>
                        <textarea name="license_notes" class="form-control" rows="2"
                                  placeholder="Attribution text or any licensing notes"><?= isset($editTrack) ? htmlspecialchars($editTrack['license_notes'] ?? '') : '' ?></textarea>
                    </div>
                </div>
                
                <?php if(!isset($editTrack)): ?>
                    <div class="mb-3">
                        <label class="form-label">Audio File *</label>
                        <input type="file" name="audio_file" class="form-control" accept="audio/*" required>
                        <small class="text-muted">MP3, WAV, OGG, FLAC up to 25MB</small>
                    </div>
                <?php else: ?>
                    <div class="mb-3">
                        <label class="form-label">Current File</label>
                        <div class="alert alert-info">
                            <strong>File:</strong> 
                            <a href="<?= htmlspecialchars($editTrack['url']) ?>" target="_blank" rel="noopener">
                                <?= htmlspecialchars(basename($editTrack['url'])) ?>
                            </a>
                            <br>
                            <small class="text-muted">To change the audio file, delete this track and upload a new one.</small>
                        </div>
                    </div>
                <?php endif; ?>

                <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary">
                        <?= isset($editTrack) ? 'Save Changes' : 'Upload Track' ?>
                    </button>
                    <?php if(isset($editTrack)): ?>
                        <a href="soundscapes.php" class="btn btn-secondary">Cancel</a>
                    <?php endif; ?>
                </div>
            </form>
        </div>

        <!-- Existing Tracks List -->
        <div class="card p-4 shadow-sm">
            <h5>Existing Tracks (<?= count($tracks) ?>)</h5>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Properties</th>
                            <th>Creator</th>
                            <th>License</th>
                            <th>Status</th>
                            <th>Preview</th>
                            <th style="width: 200px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach($tracks as $t): 
                            // Normalize URL for audio player
                            $url = $t['url'] ?? '';
                            if (!preg_match('#^(https?://|/|\./)#', $url)) {
                                $url = '/abundance-alchemy/assets/audio/' . ltrim($url, '/');
                            }
                        ?>
                        <tr>
                            <td>
                                <strong><?= htmlspecialchars($t['name']) ?></strong>
                                <?php if($t['user_email']): ?>
                                    <br><small class="text-muted">User: <?= htmlspecialchars($t['user_email']) ?></small>
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="badge bg-secondary"><?= htmlspecialchars($t['category']) ?></span>
                            </td>
                            <td>
                                <?php if($t['duration_seconds']): ?>
                                    <span class="badge duration-badge metadata-badge">
                                        <?= gmdate("i:s", $t['duration_seconds']) ?>
                                    </span>
                                <?php endif; ?>
                                
                                <?php if($t['bpm']): ?>
                                    <span class="badge bpm-badge metadata-badge">
                                        <?= $t['bpm'] ?> BPM
                                    </span>
                                <?php endif; ?>
                                
                                <?php if($t['energy_level']): ?>
                                    <span class="badge energy-<?= $t['energy_level'] ?> metadata-badge">
                                        <?= ucfirst($t['energy_level']) ?>
                                    </span>
                                <?php endif; ?>
                                
                                <?php if($t['usage_purpose']): ?>
                                    <span class="badge purpose-badge metadata-badge">
                                        <?= htmlspecialchars($t['usage_purpose']) ?>
                                    </span>
                                <?php endif; ?>
                                
                                <?php if($t['is_loopable']): ?>
                                    <span class="badge bg-info metadata-badge">Loopable</span>
                                <?php endif; ?>
                                
                                <?php if($t['tags']): ?>
                                    <br><small class="text-muted">Tags: <?= htmlspecialchars($t['tags']) ?></small>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (!empty($t['creator_name'])): ?>
                                    <?php if (!empty($t['creator_website'])): ?>
                                        <a href="<?= htmlspecialchars($t['creator_website']) ?>" target="_blank" rel="noopener">
                                            <?= htmlspecialchars($t['creator_name']) ?>
                                        </a>
                                    <?php else: ?>
                                        <?= htmlspecialchars($t['creator_name']) ?>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (!empty($t['license_type'])): ?>
                                    <div><small><?= htmlspecialchars($t['license_type']) ?></small></div>
                                <?php endif; ?>
                                <?php if (!empty($t['license_notes'])): ?>
                                    <small class="text-muted"><?= nl2br(htmlspecialchars($t['license_notes'])) ?></small>
                                <?php endif; ?>
                                <?php if (empty($t['license_type']) && empty($t['license_notes'])): ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="badge <?= $t['is_active'] ? 'bg-success' : 'bg-danger' ?>">
                                    <?= $t['is_active'] ? 'Active' : 'Inactive' ?>
                                </span>
                                <br>
                                <span class="badge <?= $t['is_public'] ? 'bg-primary' : 'bg-warning' ?> mt-1">
                                    <?= $t['is_public'] ? 'Public' : 'Private' ?>
                                </span>
                                <?php if($t['created_at']): ?>
                                    <br><small class="text-muted"><?= date('M d, Y', strtotime($t['created_at'])) ?></small>
                                <?php endif; ?>
                            </td>
                            <td>
                                <audio controls src="<?= htmlspecialchars($url) ?>" class="audio-player-small"></audio>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="?edit=<?= (int)$t['id'] ?>" class="btn btn-outline-primary">
                                        Edit
                                    </a>
                                    <a href="?toggle=<?= (int)$t['id'] ?>" class="btn btn-outline-<?= $t['is_active'] ? 'warning' : 'success' ?>"
                                       onclick="return confirm('Toggle active status?')">
                                        <?= $t['is_active'] ? 'Deactivate' : 'Activate' ?>
                                    </a>
                                    <a href="?toggle_public=<?= (int)$t['id'] ?>" class="btn btn-outline-<?= $t['is_public'] ? 'warning' : 'info' ?>"
                                       onclick="return confirm('Toggle public visibility?')">
                                        <?= $t['is_public'] ? 'Make Private' : 'Make Public' ?>
                                    </a>
                                    <a href="?delete=<?= (int)$t['id'] ?>" class="btn btn-outline-danger"
                                       onclick="return confirm('Delete this track permanently?')">
                                        Delete
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($tracks)): ?>
                        <tr><td colspan="8" class="text-muted text-center py-4">No tracks uploaded yet.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>