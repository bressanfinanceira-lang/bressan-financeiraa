const db = require('./db');

async function getAll() {
  const [rows] = await db.query(
    `SELECT r.*, c.nome AS cliente_nome, c.email AS cliente_email
     FROM reservas r
     LEFT JOIN clientes c ON c.id = r.cliente_id
     ORDER BY r.created_at DESC`
  );
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM reservas WHERE id = ?', [id]);
  return rows[0];
}

async function create({ cliente_id, carta_id, status = 'pendente' }) {
  const [result] = await db.query(
    'INSERT INTO reservas (cliente_id, carta_id, status) VALUES (?, ?, ?)',
    [cliente_id, carta_id, status]
  );
  return result.insertId;
}

module.exports = {
  getAll,
  getById,
  create,
};
