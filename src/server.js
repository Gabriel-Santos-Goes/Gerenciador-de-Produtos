// importações de módulos
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js'; // Ajuste o caminho se necessário (ex: './db.js')

// Configurações para obter o diretório atual (necessário para servir arquivos estáticos)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações básicas
app.use(express.json());
app.use(cors());

// ... logo abaixo dos teus outros app.use():
app.use(express.static(path.join(__dirname, '../public')));


// Lista temporária em memória para simular a base de dados
let produtos = [
    { id: 1, nome: 'Teclado Mecânico', preco: 250.00, quantidade: 15 },
    { id: 2, nome: 'Mouse Gamer', preco: 120.00, quantidade: 30 },
    { id: 3, nome: 'Monitor 24"', preco: 850.00, quantidade: 7 }
];

// Rota de status do servidor
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        mensagem: 'API do SaaS de Estoque funcionando perfeitamente!',
        timestamp: new Date()
    });
});

// Rota para listar todos os produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const [linhas] = await pool.query('SELECT * FROM produtos');
        res.json({ dados: linhas }); // Mantido em formato compatível com o front-end
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

// Rota para cadastrar um novo produto
app.post('/api/produtos', async (req, res) => {
    try {
        const { nome, preco, quantidade } = req.body;
        
        const sql = 'INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)';
        const [resultado] = await pool.query(sql, [nome, preco, quantidade]);

        res.status(201).json({
            id: resultado.insertId,
            nome,
            preco,
            quantidade
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao cadastrar produto' });
    }
});

// Middleware global de erro (deve ficar SEMPRE depois de todas as rotas)
app.use(errorMiddleware);

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});