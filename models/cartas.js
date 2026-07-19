const db = require('./db');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM cartas ORDER BY created_at DESC');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM cartas WHERE id = ?', [id]);
  return rows[0];
}

async function create({ titulo, categoria, descricao, valor, status = 'disponivel' }) {
  const [result] = await db.query(
    'INSERT INTO cartas (titulo, categoria, descricao, valor, status) VALUES (?, ?, ?, ?, ?)',
    [titulo, categoria, descricao, valor, status]
  );
  return result.insertId;
}

async function update(id, { titulo, categoria, descricao, valor, status }) {
  await db.query(
    'UPDATE cartas SET titulo = ?, categoria = ?, descricao = ?, valor = ?, status = ? WHERE id = ?',
    [titulo, categoria, descricao, valor, status, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM cartas WHERE id = ?', [id]);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
