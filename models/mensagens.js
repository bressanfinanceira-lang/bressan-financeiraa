const db = require('./db');

async function getAll() {
  const [rows] = await db.query(
    `SELECT m.id, c.nome AS cliente_nome, c.email AS cliente_email, m.assunto, m.mensagem, m.created_at
     FROM mensagens m
     LEFT JOIN clientes c ON c.id = m.cliente_id
     ORDER BY m.created_at DESC`
  );
  return rows;
}

async function create({ clienteId, assunto, mensagem }) {
  const [result] = await db.query(
    'INSERT INTO mensagens (cliente_id, assunto, mensagem) VALUES (?, ?, ?)',
    [clienteId, assunto, mensagem]
  );
  return result.insertId;
}

module.exports = {
  getAll,
  create,
};
