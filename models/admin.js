const adminUser = {
  username: process.env.ADMIN_USER || '090030',
  password: process.env.ADMIN_PASS || '6592',
};

const db = require('./db');

async function getStats() {
  const [rows] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM cartas) AS totalCartas,
      (SELECT COUNT(*) FROM cartas WHERE status = 'disponivel') AS disponiveis,
      (SELECT COUNT(*) FROM cartas WHERE status = 'reservada') AS reservadas,
      (SELECT COUNT(*) FROM cartas WHERE status = 'vendida') AS vendidas,
      (SELECT COUNT(*) FROM simulacoes) AS simulacoes,
      (SELECT COUNT(*) FROM mensagens) AS contatos
  `);

  return rows[0] || {
    totalCartas: 0,
    disponiveis: 0,
    reservadas: 0,
    vendidas: 0,
    simulacoes: 0,
    contatos: 0,
  };
}

function verifyAdmin(username, password) {
  return username === adminUser.username && password === adminUser.password;
}

module.exports = {
  verifyAdmin,
  getStats,
};
