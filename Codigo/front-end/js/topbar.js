// Função que roda assim que a tela carrega
document.addEventListener("DOMContentLoaded", () => {
    carregarUsuarioLogado();
});

async function carregarUsuarioLogado() {
    try {
        // Aqui você coloca o endereço do seu backend Java
        // Exemplo: 'http://localhost:8080/api/usuario/atual'
        const urlDoSeuBackend = 'URL_DO_SEU_BACKEND_AQUI'; 

        // Faz a requisição para o Java
        const resposta = await fetch(urlDoSeuBackend, {
            method: 'GET',
            headers: {
                // Se você for usar JWT ou Tokens de autenticação depois, eles entram aqui
                'Content-Type': 'application/json'
            }
        });

        if (resposta.ok) {
            // Se o Java respondeu com sucesso, pega o JSON
            const dadosUsuario = await resposta.json();
            
            // Supondo que o Java retornou algo como: { "nome": "Maria", "role": "ADMIN" }
            const nomeElemento = document.getElementById('nome-usuario');
            
            // Injeta o nome na tela
            nomeElemento.innerText = dadosUsuario.nome;
        } else {
            // Se der erro (ex: usuário não logado)
            document.getElementById('nome-usuario').innerText = "Visitante";
        }

    } catch (erro) {
        console.error("Erro ao conectar com o backend:", erro);
        document.getElementById('nome-usuario').innerText = "Usuário"; // Fallback caso o back esteja fora do ar
    }
}