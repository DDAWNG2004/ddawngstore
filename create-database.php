<?php
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host", $user, $pass);
    
    // Tạo database
    $conn->exec("CREATE DATABASE IF NOT EXISTS ddawngstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Database ddawngstore created successfully!\n";
    
    // Sử dụng database
    $conn->exec("USE ddawngstore");
    
    // Đọc và thực thi file SQL
    $sql = file_get_contents('setup-database.sql');
    $conn->exec($sql);
    echo "✅ Tables created successfully!\n";
    
    echo "✅ Database setup completed!\n";
    
} catch(PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
