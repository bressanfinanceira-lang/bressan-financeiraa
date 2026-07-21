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
  const sql = 'INSERT INTO simulacoes (nome, email, telefone, tipo, valor_solicitado, mensagem) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [nome, email, telefone, tipo, valor_solicitado, mensagem];
  console.log('Executing SQL (simulacoes.create):', sql, params);
  try {
    const [result] = await db.query(sql, params);
    return result.insertId;
  } catch (error) {
    console.error('MySQL error (simulacoes.create):', error, 'SQL:', sql, 'params:', params);
    throw error;
  }
}

module.exports = {
  getAll,
  getById,
  create,
};
