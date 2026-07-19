const express = require('express');
const path = require('path');
const router = express.Router();

const clientesModel = require('../models/clientes');
const simulacoesModel = require('../models/simulacoes');
const mensagensModel = require('../models/mensagens');
const reservasModel = require('../models/reservas');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

router.post('/simulacao', async (req, res) => {
  const {
    fullName,
    email,
    phone,
    desiredAsset,
    creditValue,
    downPayment,
    installment,
    notes,
  } = req.body;

  const nome = fullName?.trim() || '';
  const telefone = phone?.trim() || '';
  const tipo = desiredAsset?.trim() || '';
  const valor = parseFloat((creditValue || '').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0.0;
  const mensagem = [
    notes?.trim(),
    downPayment ? `Valor de entrada: ${downPayment}` : null,
    installment ? `Parcela desejada: ${installment}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const clienteId = await clientesModel.create({ nome, email, telefone });
    await simulacoesModel.create({
      nome,
      email,
      telefone,
      tipo,
      valor_solicitado: valor,
      mensagem,
    });
    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true });
    }
    req.flash('success', 'Simulação enviada com sucesso.');
  } catch (error) {
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: 'Erro ao enviar simulação.' });
    }
    req.flash('error', 'Erro ao enviar simulação. Tente novamente.');
  }
  res.redirect('/');
});

router.post('/contato', async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;

  try {
    const clienteId = await clientesModel.create({ nome, email, telefone });
    await mensagensModel.create({ clienteId, assunto, mensagem });
    req.flash('success', 'Mensagem enviada com sucesso.');
  } catch (error) {
    req.flash('error', 'Erro ao enviar mensagem. Tente novamente.');
  }
  res.redirect('/');
});

router.post('/reservar', async (req, res) => {
  const { nome, email, telefone, carta_id } = req.body;

  try {
    const clienteId = await clientesModel.create({ nome, email, telefone });
    await reservasModel.create({ cliente_id: clienteId, carta_id });
    req.flash('success', 'Reserva enviada com sucesso.');
  } catch (error) {
    req.flash('error', 'Erro ao enviar reserva. Tente novamente.');
  }
  res.redirect('/');
});

module.exports = router;
