
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('.formulario');

    if (!formulario) {
        console.error('Formulário não encontrado!');
        return;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const dados = new FormData(formulario);

        const usuario = {
            nome: dados.get('nome'),
            email: dados.get('email'),
            senha: dados.get('senha'),
            idade: dados.get('idade'),
            data_nascimento: dados.get('data_nascimento'),
            genero: dados.get('genero')
        };

        try {
            const resposta = await fetch('/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });

            const resultado = await resposta.text();

            if (!resposta.ok) {
                alert(resultado);
                return;
            }

            alert('Cadastro realizado com sucesso!');
            formulario.reset();

        } catch (erro) {
            console.error('Erro:', erro);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});