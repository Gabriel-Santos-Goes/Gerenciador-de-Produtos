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

// Rota para atualizar um produto existente
app.put('/api/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, quantidade } = req.body;

        const sql = 'UPDATE produtos SET nome = ?, preco = ?, quantidade = ? WHERE id = ?';
        const [resultado] = await pool.query(sql, [nome, preco, quantidade, id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto atualizado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
});

// Rota para deletar um produto pelo ID
app.delete('/api/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID que vem na URL

        const sql = 'DELETE FROM produtos WHERE id = ?';
        const [resultado] = await pool.query(sql, [id]);

        // Verifica se realmente encontrou e apagou algum produto com esse ID
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto deletado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao deletar produto' });
    }
});

// Middleware global de erro (deve ficar SEMPRE depois de todas as rotas)
app.use(errorMiddleware);

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});