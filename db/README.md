# Banco de dados da corretora

O esquema usa PostgreSQL gerenciado pelo Netlify Database e Drizzle ORM. A
definição tipada fica em `db/schema.ts`, o cliente compartilhado em
`db/index.ts` e as migrations aplicadas pela Netlify em
`netlify/database/migrations`.

## Estrutura

- `clientes`: dados de contato de quem solicita uma cotação.
- `cotacoes`: veículo, andamento e observações da solicitação.
- `coberturas`: catálogo reutilizável de coberturas disponíveis.
- `cotacao_coberturas`: associação muitos-para-muitos sem duplicidades.
- `usuarios`: acessos administrativos com e-mail único sem distinção de caixa.

As cotações pertencem obrigatoriamente a um cliente. A exclusão de clientes é
restrita quando existem cotações, preservando o histórico comercial. Ao excluir
uma cotação, apenas suas associações em `cotacao_coberturas` são removidas em
cascata. Coberturas em uso não podem ser excluídas.

## Valores controlados

- Tipo de veículo: `carro`, `moto`, `caminhao`.
- Status: `nova`, `em_analise`, `cotada`, `aguardando_cliente`, `fechada`,
  `cancelada`.
- Perfil: `administrador`, `corretor`.

Esses valores são enums do PostgreSQL, evitando estados inválidos. A aplicação
pode apresentar os rótulos em português com acentos sem alterar os valores
persistidos.

## Desempenho e automação

Índices B-tree atendem filtros exatos, relacionamentos, status, tipo de veículo
e ordenação temporal. Índices trigram aceleram pesquisas parciais por nome,
telefone, e-mail, marca e modelo. Triggers mantêm `updated_at` automaticamente
em clientes, cotações e usuários.

A migration inicial também cadastra as nove coberturas padrão de forma
idempotente. Novas alterações devem ser feitas primeiro em `db/schema.ts` e
geradas com `npm run db:generate`.

## Segurança

O campo `usuarios.senha_hash` aceita somente hashes produzidos por um algoritmo
apropriado, como Argon2id ou bcrypt. Senhas em texto puro não devem ser gravadas.
Consultas devem usar a API parametrizada do Drizzle e regras de autorização no
servidor antes de expor dados ao painel administrativo.
