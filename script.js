
const API_URL = "https://oquefazeremudi.onrender.com/api";
const listaLugares = document.getElementById("lista-lugares");

const botoesCategorias = document.querySelectorAll("[data-categoria]");



let lugares = [];
let categoriaSelecionada = "";



function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}



async function carregarLugares() {

    listaLugares.innerHTML = "<p>Carregando lugares...</p>";

    try {

        const resposta = await fetch(`${API_URL}/lugares`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        lugares = Array.isArray(dados) ? dados : dados.lugares;

        if (!Array.isArray(lugares)) {
            throw new Error("A API não retornou uma lista de lugares.");
        }

        console.log("Lugares carregados:", lugares.length);

        aplicarFiltros();

    } catch (erro) {

        console.error("Erro ao carregar lugares:", erro);

        listaLugares.innerHTML = `
            <p class="mensagem-vazia">
                Não foi possível carregar os lugares.
                Verifique se o servidor está funcionando.
            </p>
        `;
    }
}



function criarCartao(lugar) {

    const card = document.createElement("article");

    card.classList.add("lugar-card");



    const conteudo = document.createElement("div");

    conteudo.classList.add("lugar-card-content");



    if (lugar.imagem_url) {

        const imagem = document.createElement("img");

        imagem.src = lugar.imagem_url;
        imagem.alt = `Foto de ${lugar.nome}`;
        imagem.loading = "lazy";

        imagem.onerror = () => imagem.remove();

        card.appendChild(imagem);
    }



    const nome = document.createElement("h3");

    nome.textContent = lugar.nome;

    conteudo.appendChild(nome);



    const descricao = document.createElement("p");

    descricao.textContent = lugar.descricao || "";

    conteudo.appendChild(descricao);



    if (lugar.bairro || lugar.endereco) {

        const endereco = document.createElement("p");

        endereco.classList.add("lugar-endereco");

        endereco.textContent = [
            lugar.bairro,
            lugar.endereco
        ].filter(Boolean).join(" - ");

        conteudo.appendChild(endereco);
    }



    const links = document.createElement("div");

    links.classList.add("lugar-links");



    if (lugar.instagram_url) {

        const instagram = document.createElement("a");

        instagram.href = lugar.instagram_url;
        instagram.textContent = "Ver Instagram";
        instagram.target = "_blank";
        instagram.rel = "noopener noreferrer";

        links.appendChild(instagram);
    }



    if (lugar.google_maps_url) {

        const mapa = document.createElement("a");

        mapa.href = lugar.google_maps_url;
        mapa.textContent = "Como chegar";
        mapa.target = "_blank";
        mapa.rel = "noopener noreferrer";

        links.appendChild(mapa);
    }

    conteudo.appendChild(links);

    card.appendChild(conteudo);

    return card;
}



function renderizarLugares(lista) {

    listaLugares.innerHTML = "";

    if (lista.length === 0) {

        listaLugares.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum lugar encontrado nesta categoria.
            </p>
        `;

        return;
    }

    lista.forEach(lugar => {

        const card = criarCartao(lugar);

        listaLugares.appendChild(card);
    });
}



function pertenceCategoria(lugar) {

    if (!categoriaSelecionada) {
        return true;
    }

    const categoriasLugar = lugar.categorias || [];

    return categoriasLugar.some(categoria => {

        const nome = typeof categoria === "string"
            ? categoria
            : categoria.nome;

        const slug = typeof categoria === "string"
            ? categoria
            : categoria.slug;

        return (
            normalizarTexto(nome) === categoriaSelecionada ||
            normalizarTexto(slug) === categoriaSelecionada
        );
    });
}



function aplicarFiltros() {

    const resultado = lugares.filter(lugar => {

        return pertenceCategoria(lugar);

    });

    console.log("Resultados encontrados:", resultado.length);

    renderizarLugares(resultado);
}


botoesCategorias.forEach(botao => {

    botao.addEventListener("click", () => {

        categoriaSelecionada = normalizarTexto(
            botao.dataset.categoria
        );


        botoesCategorias.forEach(item => {
            item.classList.remove("active");
        });

        botao.classList.add("active");


        aplicarFiltros();

    });

});


// =========================================
// INICIAR PÁGINA
// =========================================

carregarLugares();
