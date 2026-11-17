<?php
include_once 'config.php';

$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
$isLocalRequest = in_array($remoteAddr, ['127.0.0.1', '::1'], true);

if (!(defined('DEBUG_MODE') && DEBUG_MODE && $isLocalRequest)) {
    http_response_code(403);
    echo "Forbidden";
    exit();
}

echo "<h1>Database Inspector (Debug Local Only)</h1>";

try {
    // List all tables
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tables as $table) {
        echo "<h3>Table: $table</h3>";
        echo "<table border='1' cellpadding='5'><tr><th>Column</th><th>Type</th></tr>";
        
        $stmt = $conn->prepare("DESCRIBE $table");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($columns as $col) {
            echo "<tr>";
            echo "<td>" . $col['Field'] . "</td>";
            echo "<td>" . $col['Type'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Show first 3 rows of data to see what it looks like
        echo "<p><i>Sample Data:</i></p>";
        $data = $conn->query("SELECT * FROM $table LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
        echo "<pre>" . print_r($data, true) . "</pre>";
        echo "<hr>";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
