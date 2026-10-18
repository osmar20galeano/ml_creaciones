<?php
// Datos de configuración del servidor de base de datos
$host     = 'localhost';
$dbname   = 'ml_creaciones';
$username = 'root';          // Por defecto en XAMPP/WAMP
$password = '';              // Vacío por defecto en local

try {
    // Cadena DSN con juego de caracteres UTF-8
    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
    
    // Opciones para manejo de errores y formato de resultados
    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    // Instancia de la conexión
    $pdo = new PDO($dsn, $username, $password, $opciones);
    
    // Descomenta la siguiente línea solo para comprobar que conectó:
    // echo "Conexión exitosa a la base de datos ml_creaciones";

} catch (PDOException $e) {
    // Manejo de error si falla la conexión
    die("Error al conectar con la base de datos: " . $e->getMessage());
}
?>