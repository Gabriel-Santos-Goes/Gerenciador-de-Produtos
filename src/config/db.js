import mysql from 'mysql2/promise';

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'GGdev007@', // Coloque a senha que você definiu na instalação do MySQL
    database: 'saas_estoque',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;