const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Importa o módulo nativo do Node para mexer com arquivos
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Caminho absoluto onde o arquivo JSON de dados vai ficar salvo
const caminhoArquivo = path.join(__dirname, 'produtos.json');

// FUNÇÃO AUXILIAR: Lê os dados do arquivo JSON de forma segura
function lerProdutosDoArquivo() {
    try {
        // Se o arquivo não existir, cria um arquivo novo com um array vazio dentro
        if (!fs.existsSync(caminhoArquivo)) {
            fs.writeFileSync(caminhoArquivo, JSON.stringify([], null, 2));
            return [];
        }
        // Lê o arquivo de texto
        const dadosTexto = fs.readFileSync(caminhoArquivo, 'utf-8');
        // Transforma o texto de volta em um Array de objetos JavaScript
        return JSON.parse(dadosTexto);
    } catch (error) {
        console.error("Erro ao ler o arquivo de produtos:", error);
        return [];
    }
}

// FUNÇÃO AUXILIAR: Salva os dados no arquivo JSON
function salvarProdutosNoArquivo(listaProdutos) {
    try {
        // Transforma o Array em texto JSON formatado e bonito (com recuo de 2 espaços)
        const dadosTexto = JSON.stringify(listaProdutos, null, 2);
        fs.writeFileSync(caminhoArquivo, dadosTexto);
    } catch (error) {
        console.error("Erro ao salvar no arquivo de produtos:", error);
    }
}

// ==========================================
// ROTAS DA API ATUALIZADAS
// ==========================================

// 1. ROTA GET: Buscar todos os produtos do arquivo
app.get('/produtos', (req, res) => {
    const produtos = lerProdutosDoArquivo();
    return res.status(200).json(produtos);
});

// 2. ROTA POST: Cadastrar produto e salvar no arquivo
app.post('/produtos', (req, res) => {
    const { nome, preco, quantidade } = req.body;

    if (!nome || !preco || !quantidade) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
    }

    const produtos = lerProdutosDoArquivo();

    const novoProduto = {
        id: Date.now().toString(),
        nome,
        preco: Number(preco),
        quantidade: Number(quantidade)
    };

    produtos.push(novoProduto);
    salvarProdutosNoArquivo(produtos); // Grava a lista atualizada no disco rígido

    return res.status(201).json(novoProduto);
});

// 3. ROTA DELETE: Excluir produto do arquivo
app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    let produtos = lerProdutosDoArquivo();
    
    const listaFiltrada = produtos.filter(produto => produto.id !== id);

    if (listaFiltrada.length === produtos.length) {
        return res.status(404).json({ erro: "Produto não encontrado." });
    }

    salvarProdutosNoArquivo(listaFiltrada); // Grava a nova lista (sem o deletado) no arquivo
    return res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
});