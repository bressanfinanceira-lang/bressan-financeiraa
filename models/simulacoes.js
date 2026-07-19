const db = require('./db');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM simulacoes ORDER BY created_at DESC');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM simulacoes WHERE id = ?', [id]);
  return rows[0];
}

async function create({ nome, email, telefone, tipo, valor_solicitado, mensagem }) {
  const [result] = await db.query(
    'INSERT INTO simulacoes (nome, email, telefone, tipo, valor_solicitado, mensagem) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, email, telefone, tipo, valor_solicitado, mensagem]
  );
  return result.insertId;
}

module.exports = {
  getAll,
  getById,
  create,
};
