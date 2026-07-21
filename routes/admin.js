const express = require('express');
const router = express.Router();

const adminModel = require('../models/admin');
const cartasModel = require('../models/cartas');
const clientesModel = require('../models/clientes');
const simulacoesModel = require('../models/simulacoes');
const reservasModel = require('../models/reservas');
const mensagensModel = require('../models/mensagens');

function ensureAdmin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/admin/login');
}

router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/admin/login');
});

router.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (adminModel.verifyAdmin(username, password)) {
    req.session.user = { username };
    req.session.lastAccess = new Date();
    return res.redirect('/admin/dashboard');
  }

  req.flash('error', 'Usuário ou senha inválidos.');
  res.redirect('/admin/login');
});

router.get('/logout', ensureAdmin, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

router.get('/dashboard', ensureAdmin, async (req, res) => {
  try {
    const stats = await adminModel.getStats();
    stats.lastAccess = req.session.lastAccess;
    res.render('admin/dashboard', { stats });
  } catch (error) {
    req.flash('error', 'Não foi possível carregar o painel.');
    res.redirect('/admin/login');
  }
});

router.get('/cartas', ensureAdmin, async (req, res) => {
  const cartas = await cartasModel.getAll();
  res.render('admin/cartas', { cartas });
});

router.get('/clientes', ensureAdmin, async (req, res) => {
  const clientes = await clientesModel.getAll();
  res.render('admin/clientes', { clientes });
});

router.get('/simulacoes', ensureAdmin, async (req, res) => {
  const simulacoes = await simulacoesModel.getAll();
  res.render('admin/simulacoes', { simulacoes });
});

router.get('/reservas', ensureAdmin, async (req, res) => {
  const reservas = await reservasModel.getAll();
  res.render('admin/reservas', { reservas });
});

router.get('/mensagens', ensureAdmin, async (req, res) => {
  const mensagens = await mensagensModel.getAll();
  res.render('admin/mensagens', { mensagens });
});

router.get('/contatos', ensureAdmin, async (req, res) => {
  const mensagens = await mensagensModel.getAll();
  res.render('admin/mensagens', { mensagens });
});

router.get('/cotacoes', ensureAdmin, (req, res) => {
  res.render('admin/cotacoes');
});

router.get('/crm', ensureAdmin, (req, res) => {
  res.render('admin/crm');
});

router.get('/usuarios', ensureAdmin, (req, res) => {
  res.render('admin/usuarios');
});

router.get('/produtos', ensureAdmin, (req, res) => {
  res.render('admin/produtos');
});

router.get('/aparencia', ensureAdmin, (req, res) => {
  res.render('admin/aparencia');
});

router.get('/relatorios', ensureAdmin, (req, res) => {
  res.render('admin/relatorios');
});

router.get('/configuracoes', ensureAdmin, (req, res) => {
  res.render('admin/configuracoes');
});

module.exports = router;
