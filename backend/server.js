
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");



const app = express();

app.use(cors());
app.use(express.json());



const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});



app.get("/", (req, res) => {
    res.send("API O que fazer em Udi está funcionando!");
});



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



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${3000}`);
});
