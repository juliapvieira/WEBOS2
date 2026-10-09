const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const porta = 3000;

// Permitir receber dados dos formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Abrir os arquivos do Front-End
app.use(express.static(
    path.join(__dirname, '..', '..', 'public')
));

// Conectar ao MySQL
const conexao = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '', // Se o root tiver senha, coloque-a aqui
    database: 'sistema_os'
});

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao MySQL:', erro.message);
        return;
    }

    console.log('MySQL conectado com sucesso!');
});

// Testar a conexão com o servidor
app.get('/api/teste', (req, res) => {
    conexao.query('SELECT DATABASE() AS banco', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({
                erro: 'Erro ao consultar o banco de dados.'
            });
        }

        res.json({
            mensagem: 'Servidor funcionando!',
            banco: resultados[0].banco
        });
    });
});

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
            console.error('Erro ao buscar ordens:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível buscar as ordens de serviço.'
            });
        }

        res.json(resultados);
    });
});

// Cadastrar usuário
app.post('/cadastro', async (req, res) => {
    const {
        nome,
        email,
        senha,
        idade,
        data_nascimento,
        genero
    } = req.body;

    if (
        !nome?.trim() ||
        !email?.trim() ||
        !senha ||
        !idade ||
        !data_nascimento ||
        !genero
    ) {
        return res.status(400).send('Preencha todos os campos.');
    }

    const idadeNumero = Number(idade);

    if (!Number.isInteger(idadeNumero) ||
        idadeNumero < 18 || idadeNumero > 120) {
        return res.status(400).send('Confira a idade informada.');
    }

    if (senha.length < 8) {
        return res.status(400).send(
            'A senha precisa ter pelo menos 8 caracteres.'
        );
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuarios
            (nome, email, senha, idade, data_nascimento, genero)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        conexao.execute(sql, [
            nome.trim(),
            email.trim().toLowerCase(),
            senhaHash,
            idadeNumero,
            data_nascimento,
            genero
        ], (erro) => {
            if (erro) {
                if (erro.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send(
                        'Este e-mail já está cadastrado.'
                    );
                }

                console.error('Erro no cadastro:', erro.message);
                return res.status(500).send(
                    'Não foi possível concluir o cadastro.'
                );
            }

            res.status(201).send('Cadastro realizado com sucesso!');
        });
    } catch (erro) {
        console.error('Erro ao processar cadastro:', erro.message);
        res.status(500).send('Ocorreu um erro no cadastro.');
    }
});

// Iniciar servidor somente após iniciar a conexão com o MySQL
conexao.connect((erro) => {
    if (erro) {
        console.error('Falha na conexão com MySQL:', erro.message);
        return;
    }

    console.log('MySQL conectado com sucesso!');

    app.listen(porta, () => {
        console.log('Servidor aberto em http://localhost:${porta}');
    });
});
