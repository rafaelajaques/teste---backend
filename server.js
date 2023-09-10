const express = require("express");
const axios = require("axios");
const db = require("./db"); // Importe o módulo de conexão com o PostgreSQL
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = { origin: "http://localhost:5173" };
// Middleware para tratar requisições JSON
app.use(express.json());
app.use(cors());

// Rota para consumir a API da Globo
app.get("/programmes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const response = await axios.get(
      `https://epg-api.video.globo.com/programmes/${id}?date=${date}`
    );
    debugger;
    const data = response.data;
    res.json(data);
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
