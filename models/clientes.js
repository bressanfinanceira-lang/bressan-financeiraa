const db = require('./db');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM clientes ORDER BY created_at DESC');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return rows[0];
}

async function create({ nome, email, telefone }) {
  const [result] = await db.query(
    'INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)',
    [nome, email, telefone]
  );
  return result.insertId;
}

module.exports = {
  getAll,
  getById,
  create,
};
