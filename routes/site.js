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

router.post('/cotacao', async (req, res) => {
  const {
    name,
    whatsapp,
    vehicleType,
    brand,
    model,
    year,
    coverages,
    notes,
  } = req.body;

  const nome = name?.trim() || '';
  const telefone = whatsapp?.trim() || '';
  const tipo = vehicleType?.trim() || '';
  const marca = brand?.trim() || '';
  const modelo = model?.trim() || '';
  const ano = year?.trim() || '';
  const observacoes = notes?.trim() || '';
  const coberturas = Array.isArray(coverages) ? coverages : coverages ? [coverages] : [];

  const mensagem = [
    `Marca: ${marca}`,
    `Modelo: ${modelo}`,
    `Ano: ${ano}`,
    coberturas.length ? `Coberturas: ${coberturas.join(', ')}` : null,
    observacoes ? `Observações: ${observacoes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  console.log('POST /cotacao body:', req.body);
  console.log('POST /cotacao parsed:', { nome, telefone, tipo, marca, modelo, ano, coberturas, observacoes, mensagem });

  try {
    console.log("Iniciando salvamento do cliente");
    const clienteId = await clientesModel.create({ nome, email: '', telefone });
    console.log("Cliente salvo com sucesso");
    await simulacoesModel.create({
      nome,
      email: '',
      telefone,
      tipo,
      valor_solicitado: 0.0,
      mensagem,
    });
    console.log("Simulação salva com sucesso");
    console.log("Retornando success:true para o frontend");
    return res.json({ success: true });
  } catch (error) {
    console.error('MySQL error /cotacao:', error);
    return res.status(500).json({ success: false, message: 'Erro ao salvar cotação.' });
  }
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
