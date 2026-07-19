import { defineRelations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const tipoVeiculoEnum = pgEnum("tipo_veiculo", [
  "carro",
  "moto",
  "caminhao",
]);

export const statusCotacaoEnum = pgEnum("status_cotacao", [
  "nova",
  "em_analise",
  "cotada",
  "aguardando_cliente",
  "fechada",
  "cancelada",
]);

export const perfilUsuarioEnum = pgEnum("perfil_usuario", [
  "administrador",
  "corretor",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: varchar("nome", { length: 160 }).notNull(),
    telefone: varchar("telefone", { length: 32 }).notNull(),
    email: varchar("email", { length: 254 }),
    cidade: varchar("cidade", { length: 120 }),
    estado: varchar("estado", { length: 2 }),
    ...timestamps,
  },
  (table) => [
    check("clientes_nome_not_blank", sql`length(trim(${table.nome})) > 0`),
    check(
      "clientes_telefone_not_blank",
      sql`length(trim(${table.telefone})) > 0`,
    ),
    check(
      "clientes_estado_formato",
      sql`${table.estado} IS NULL OR ${table.estado} ~ '^[A-Z]{2}$'`,
    ),
    index("clientes_nome_idx").on(table.nome),
    index("clientes_telefone_idx").on(table.telefone),
    index("clientes_email_idx").on(table.email),
    index("clientes_email_lower_idx").on(sql`lower(${table.email})`),
  ],
);

export const cotacoes = pgTable(
  "cotacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => clientes.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    tipoVeiculo: tipoVeiculoEnum("tipo_veiculo").notNull(),
    marca: varchar("marca", { length: 100 }).notNull(),
    modelo: varchar("modelo", { length: 120 }).notNull(),
    ano: integer("ano").notNull(),
    observacoes: text("observacoes"),
    status: statusCotacaoEnum("status").notNull().default("nova"),
    ...timestamps,
  },
  (table) => [
    check("cotacoes_marca_not_blank", sql`length(trim(${table.marca})) > 0`),
    check(
      "cotacoes_modelo_not_blank",
      sql`length(trim(${table.modelo})) > 0`,
    ),
    check("cotacoes_ano_valido", sql`${table.ano} BETWEEN 1886 AND 2100`),
    index("cotacoes_cliente_id_idx").on(table.clienteId),
    index("cotacoes_cliente_created_at_idx").on(
      table.clienteId,
      table.createdAt,
    ),
    index("cotacoes_tipo_veiculo_idx").on(table.tipoVeiculo),
    index("cotacoes_status_idx").on(table.status),
    index("cotacoes_marca_idx").on(table.marca),
    index("cotacoes_modelo_idx").on(table.modelo),
    index("cotacoes_created_at_idx").on(table.createdAt),
  ],
);

export const coberturas = pgTable(
  "coberturas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: varchar("nome", { length: 120 }).notNull(),
  },
  (table) => [
    check("coberturas_nome_not_blank", sql`length(trim(${table.nome})) > 0`),
    uniqueIndex("coberturas_nome_unique").on(table.nome),
  ],
);

export const cotacaoCoberturas = pgTable(
  "cotacao_coberturas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cotacaoId: uuid("cotacao_id")
      .notNull()
      .references(() => cotacoes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    coberturaId: uuid("cobertura_id")
      .notNull()
      .references(() => coberturas.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    uniqueIndex("cotacao_coberturas_cotacao_cobertura_unique").on(
      table.cotacaoId,
      table.coberturaId,
    ),
    index("cotacao_coberturas_cotacao_id_idx").on(table.cotacaoId),
    index("cotacao_coberturas_cobertura_id_idx").on(table.coberturaId),
  ],
);

export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: varchar("nome", { length: 160 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    senhaHash: text("senha_hash").notNull(),
    perfil: perfilUsuarioEnum("perfil").notNull().default("corretor"),
    ...timestamps,
  },
  (table) => [
    check("usuarios_nome_not_blank", sql`length(trim(${table.nome})) > 0`),
    check("usuarios_email_not_blank", sql`length(trim(${table.email})) > 0`),
    check(
      "usuarios_senha_hash_not_blank",
      sql`length(trim(${table.senhaHash})) > 0`,
    ),
    uniqueIndex("usuarios_email_lower_unique").on(
      sql`lower(${table.email})`,
    ),
    index("usuarios_perfil_idx").on(table.perfil),
  ],
);

export const databaseRelations = defineRelations(
  { clientes, cotacoes, coberturas, cotacaoCoberturas, usuarios },
  ({ clientes, cotacoes, coberturas, cotacaoCoberturas, one, many }) => ({
    clientes: {
      cotacoes: many.cotacoes(),
    },
    cotacoes: {
      cliente: one.clientes({
        from: cotacoes.clienteId,
        to: clientes.id,
        optional: false,
      }),
      coberturas: many.cotacaoCoberturas(),
    },
    coberturas: {
      cotacoes: many.cotacaoCoberturas(),
    },
    cotacaoCoberturas: {
      cotacao: one.cotacoes({
        from: cotacaoCoberturas.cotacaoId,
        to: cotacoes.id,
        optional: false,
      }),
      cobertura: one.coberturas({
        from: cotacaoCoberturas.coberturaId,
        to: coberturas.id,
        optional: false,
      }),
    },
  }),
);

export type Cliente = typeof clientes.$inferSelect;
export type NovoCliente = typeof clientes.$inferInsert;
export type Cotacao = typeof cotacoes.$inferSelect;
export type NovaCotacao = typeof cotacoes.$inferInsert;
export type Cobertura = typeof coberturas.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
