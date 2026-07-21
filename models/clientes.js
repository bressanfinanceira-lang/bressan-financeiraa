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
  const sql = 'INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)';
  const params = [nome, email, telefone];
  console.log('Executing SQL (clientes.create):', sql, params);
  try {
    const [result] = await db.query(sql, params);
    return result.insertId;
  } catch (error) {
    console.error('MySQL error (clientes.create):', error, 'SQL:', sql, 'params:', params);
    throw error;
  }
}

module.exports = {
  getAll,
  getById,
  create,
};
