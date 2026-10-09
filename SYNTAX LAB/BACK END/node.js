const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const { clearScreenDown } = require('readline');

const app = express();
const porta = 3000;

// Conexão com o banco de dados
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_os'
});

// Verificar conexão
conexao.connect((erro) => {
    if (erro) {
        console.log('Erro ao conectar ao MySQL:', erro.message);
        return;
    }

    console.log('Banco de dados conectado!');
});


// Arquivos do site
app.use(express.json());
app.use(express.static(
    path.join(__dirname, '..', '..', 'public')));
app.use(express.urlencoded({ extended: false }));

// Buscar ordens de serviço
app.get('/api/ordens', (req, res) => {
    const sql = `
        SELECT
            os.id_os,
            c.nome AS cliente,
            e.nome AS equipamento,
            t.nome AS tecnico,
            s.descricao AS status,
            DATE_FORMAT(os.data_os, '%d/%m/%Y') AS data
        FROM ordens_servico os
        INNER JOIN clientes c
            ON os.id_cliente = c.id_cliente
        INNER JOIN equipamentos e
            ON os.id_equipamento = e.id_equipamento
        INNER JOIN tecnicos t
            ON os.id_tecnico = t.id_tecnico
        INNER JOIN status_os s
            ON os.id_status = s.id_status
        ORDER BY os.id_os
    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            return res.status(500).json({
                erro: 'Não foi possível buscar as ordens.'
            });
        }

        res.json(resultados);
    });
});

app.listen(porta, () => {
    console.log('Site aberto em http://localhost:${porta}');
});