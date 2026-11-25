<?php
// --- PROSES BACKUP (JIKA TOMBOL DOWNLOAD DIKLIK) ---
if (isset($_GET['action']) && $_GET['action'] == 'download') {
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "db_study_planner"; // Sesuaikan nama database kamu

    $conn = new mysqli($host, $user, $pass, $dbname);
    if ($conn->connect_error) {
        die("Koneksi gagal: " . $conn->connect_error);
    }

    $tables = [];
    $result = $conn->query("SHOW TABLES");
    while ($row = $result->fetch_row()) {
        $tables[] = $row[0];
    }

    $sqlScript = "-- Backup Database Study Planner\n";
    $sqlScript .= "-- Waktu Backup: " . date('Y-m-d H:i:s') . "\n\n";

    foreach ($tables as $table) {
        $rowCreate = $conn->query("SHOW CREATE TABLE `$table`")->fetch_row();
        $sqlScript .= "DROP TABLE IF EXISTS `$table`;\n";
        $sqlScript .= $rowCreate[1] . ";\n\n";

        $resultData = $conn->query("SELECT * FROM `$table`");
        $columnCount = $resultData->field_count;

        while ($row = $resultData->fetch_row()) {
            $sqlScript .= "INSERT INTO `$table` VALUES(";
            for ($j = 0; $j < $columnCount; $j++) {
                if (isset($row[$j])) {
                    $escaped = $conn->real_escape_string($row[$j]);
                    $sqlScript .= '"' . $escaped . '"';
                } else {
                    $sqlScript .= 'NULL';
                }
                if ($j < ($columnCount - 1)) {
                    $sqlScript .= ',';
                }
            }
            $sqlScript .= ");\n";
        }
        $sqlScript .= "\n\n";
    }

    $filename = 'backup_study_planner_' . date('Y-m-d_H-i-s') . '.sql';
    header('Content-Type: application/sql');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo $sqlScript;
    exit;
}

// --- PROSES RESTORE (JIKA FORM UPLOAD DI-SUBMIT) ---
if (isset($_POST['restore'])) {
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "db_study_planner";

    $conn = new mysqli($host, $user, $pass, $dbname);
    
    if (isset($_FILES['file_sql']) && $_FILES['file_sql']['error'] == 0) {
        $ext = pathinfo($_FILES['file_sql']['name'], PATHINFO_EXTENSION);
        
        if ($ext !== 'sql') {
            echo "<script>alert('Error: File harus berformat .sql!');</script>";
        } else {
            $sqlContent = file_get_contents($_FILES['file_sql']['tmp_name']);
            
            if ($conn->multi_query($sqlContent)) {
                do {
                    if ($res = $conn->store_result()) {
                        $res->free();
                    }
                } while ($conn->more_results() && $conn->next_result());
                
                echo "<script>alert('Database berhasil di-restore!'); window.location='backup.php';</script>";
            } else {
                echo "<script>alert('Gagal restore: " . $conn->error . "');</script>";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Backup & Restore - Study Planner</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f4f7f6; }
        .card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #333; }
        .btn { background: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; border: none; cursor: pointer; }
        .btn:hover { background: #4338ca; }
    </style>
</head>
<body>

    <h2>Manajemen Database Study Planner</h2>

    <!-- Bagian 1: Tombol Download Backup -->
    <div class="card">
        <h3>1. Backup Database</h3>
        <p>Unduh seluruh data struktur dan isi database proyek kamu ke dalam format file <code>.sql</code>.</p>
        <a href="backup.php?action=download" class="btn">Download Backup (.SQL)</a>
    </div>

    <!-- Bagian 2: Form Upload Restore -->
    <div class="card">
        <h3>2. Restore Database</h3>
        <p>Unggah kembali file cadangan <code>.sql</code> untuk memulihkan data database.</p>
        <form action="backup.php" method="POST" enctype="multipart/form-data">
            <input type="file" name="file_sql" accept=".sql" required style="margin-bottom: 10px; display: block;">
            <button type="submit" name="restore" class="btn" onclick="return confirm('Yakin ingin merestore database? Data lama mungkin akan tertimpa.')">Restore Database</button>
        </form>
    </div>

</body>
</html>