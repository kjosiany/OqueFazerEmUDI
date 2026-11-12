
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");


// 2. Configurando o servidor

const app = express();

app.use(cors());
app.use(express.json());


// 3. Configurando a conexão com o PostgreSQL

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// 4. Rota inicial: verificar se a API está funcionando

app.get("/", (req, res) => {
    res.send("API O que fazer em Udi está funcionando!");
});


// 5. Rota: buscar todos os lugares

app.get("/api/lugares", async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT
                l.id,
                l.nome,
                l.descricao,
                l.endereco,
                l.bairro,
                l.imagem_url,
                l.instagram_url,
                l.google_maps_url,

                COALESCE(
                    json_agg(
                        json_build_object(
                            'nome', c.nome,
                            'slug', c.slug
                        )
                    ) FILTER (WHERE c.id IS NOT NULL),
                    '[]'::json
                ) AS categorias

            FROM lugares l

            LEFT JOIN lugar_categorias lc
                ON l.id = lc.lugar_id

            LEFT JOIN categorias c
                ON lc.categoria_id = c.id

            GROUP BY l.id

            ORDER BY l.nome;
        `);

        res.json(resultado.rows);

    } catch (erro) {

        console.error("Erro ao buscar lugares:", erro);

        res.status(500).json({
            erro: "Não foi possível buscar os lugares."
        });

    }

});


// 6. Iniciando o servidor

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${3000}`);
});
