// src/server.js
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações básicas
app.use(express.json());
app.use(cors());

// Rota de teste
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        mensagem: 'API do SaaS de Estoque funcionando perfeitamente!',
        timestamp: new Date()
    });
});

// Rota de exemplo que simula um erro para testar o middleware
app.get('/api/erro-teste', (req, res, next) => {
    try {
        throw new Error('Falha simulada propositalmente!');
    } catch (erro) {
        next(erro); // Envia o erro para o middleware global
    }
});

// Middleware global de erro (fica sempre DEPOIS de todas as rotas)
app.use(errorMiddleware);

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});