const { Client } = require("pg");

const clientConfig = {
  user: "seu-usuario",
  host: "localhost",
  database: "seu-banco-de-dados",
  password: "sua-senha",
  port: 5432, // Porta padrão do PostgreSQL
};

module.exports = clientConfig;
