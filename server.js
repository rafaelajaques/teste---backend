const express = require("express");
const axios = require("axios");
const db = require("./db"); // Importe o módulo de conexão com o PostgreSQL
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { Client } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Middleware para tratar requisições JSON
app.use(express.json());
app.use(cors());
const clientConfig = {
  user: "postgres",
  host: "localhost",
  database: "rpc",
  password: "postgres",
  port: 5432, // Porta padrão do PostgreSQL
};

// Rota para consumir a API da Globo
app.get("/programmes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const client = new Client(clientConfig);

    client.connect();

    let retorno = "";

    const query =
      "select id, data, dados from public.programacao2 where data = '" +
      date +
      "'";

    const result = await client.query(query);

    await client.end();

    if (result.rows.length == 0) {
      const response = await axios.get(
        `https://epg-api.video.globo.com/programmes/${id}?date=${date}`
      );

      const data = response.data;

      const client2 = new Client(clientConfig);
      client2.connect();
      const uuid = uuidv4();

      const queryInsert = `insert into programacao2 (id, data, dados) values('${uuid}','${date}','${JSON.stringify(
        data
      )}')`;

      await client2.query(queryInsert);

      retorno = data;
      console.log("Busca na API");
      res.json(data);
    } else {
      const row = result.rows[0];
      retorno = row.dados;
      console.log("Busca no Banco");
    }

    res.json(JSON.parse(retorno));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao consumir a API da Globo" });
  }
});

// Rota para inserir dados no PostgreSQL
app.post("/programmes", async (req, res) => {
  try {
    const { id, name, description } = req.body;
    const query =
      "INSERT INTO programas (id, name, description) VALUES ($1, $2, $3)";
    await db.query(query, [id, name, description]);
    res.json({ message: "Programa inserido com sucesso" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao inserir programa no banco de dados" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
