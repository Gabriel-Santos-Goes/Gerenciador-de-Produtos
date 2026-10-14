// src/middlewares/errorMiddleware.js

export const errorMiddleware = (err, req, res, next) => {
    console.error('❌ Erro capturado:', err.message);

    res.status(500).json({
        sucesso: false,
        mensagem: 'Ocorreu um erro interno no servidor.',
        detalhes: err.message
    });
};