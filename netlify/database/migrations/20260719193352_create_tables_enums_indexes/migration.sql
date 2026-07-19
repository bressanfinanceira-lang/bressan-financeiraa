CREATE TYPE "perfil_usuario" AS ENUM('administrador', 'corretor');--> statement-breakpoint
CREATE TYPE "status_cotacao" AS ENUM('nova', 'em_analise', 'cotada', 'aguardando_cliente', 'fechada', 'cancelada');--> statement-breakpoint
CREATE TYPE "tipo_veiculo" AS ENUM('carro', 'moto', 'caminhao');--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"nome" varchar(160) NOT NULL,
	"telefone" varchar(32) NOT NULL,
	"email" varchar(254),
	"cidade" varchar(120),
	"estado" varchar(2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_nome_not_blank" CHECK (length(trim("nome")) > 0),
	CONSTRAINT "clientes_telefone_not_blank" CHECK (length(trim("telefone")) > 0),
	CONSTRAINT "clientes_estado_formato" CHECK ("estado" IS NULL OR "estado" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
CREATE TABLE "coberturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"nome" varchar(120) NOT NULL,
	CONSTRAINT "coberturas_nome_not_blank" CHECK (length(trim("nome")) > 0)
);
--> statement-breakpoint
CREATE TABLE "cotacao_coberturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cotacao_id" uuid NOT NULL,
	"cobertura_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cotacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cliente_id" uuid NOT NULL,
	"tipo_veiculo" "tipo_veiculo" NOT NULL,
	"marca" varchar(100) NOT NULL,
	"modelo" varchar(120) NOT NULL,
	"ano" integer NOT NULL,
	"observacoes" text,
	"status" "status_cotacao" DEFAULT 'nova'::"status_cotacao" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cotacoes_marca_not_blank" CHECK (length(trim("marca")) > 0),
	CONSTRAINT "cotacoes_modelo_not_blank" CHECK (length(trim("modelo")) > 0),
	CONSTRAINT "cotacoes_ano_valido" CHECK ("ano" BETWEEN 1886 AND 2100)
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"nome" varchar(160) NOT NULL,
	"email" varchar(254) NOT NULL,
	"senha_hash" text NOT NULL,
	"perfil" "perfil_usuario" DEFAULT 'corretor'::"perfil_usuario" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_nome_not_blank" CHECK (length(trim("nome")) > 0),
	CONSTRAINT "usuarios_email_not_blank" CHECK (length(trim("email")) > 0),
	CONSTRAINT "usuarios_senha_hash_not_blank" CHECK (length(trim("senha_hash")) > 0)
);
--> statement-breakpoint
CREATE INDEX "clientes_nome_idx" ON "clientes" ("nome");--> statement-breakpoint
CREATE INDEX "clientes_telefone_idx" ON "clientes" ("telefone");--> statement-breakpoint
CREATE INDEX "clientes_email_idx" ON "clientes" ("email");--> statement-breakpoint
CREATE INDEX "clientes_email_lower_idx" ON "clientes" (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "coberturas_nome_unique" ON "coberturas" ("nome");--> statement-breakpoint
CREATE UNIQUE INDEX "cotacao_coberturas_cotacao_cobertura_unique" ON "cotacao_coberturas" ("cotacao_id","cobertura_id");--> statement-breakpoint
CREATE INDEX "cotacao_coberturas_cotacao_id_idx" ON "cotacao_coberturas" ("cotacao_id");--> statement-breakpoint
CREATE INDEX "cotacao_coberturas_cobertura_id_idx" ON "cotacao_coberturas" ("cobertura_id");--> statement-breakpoint
CREATE INDEX "cotacoes_cliente_id_idx" ON "cotacoes" ("cliente_id");--> statement-breakpoint
CREATE INDEX "cotacoes_cliente_created_at_idx" ON "cotacoes" ("cliente_id","created_at");--> statement-breakpoint
CREATE INDEX "cotacoes_tipo_veiculo_idx" ON "cotacoes" ("tipo_veiculo");--> statement-breakpoint
CREATE INDEX "cotacoes_status_idx" ON "cotacoes" ("status");--> statement-breakpoint
CREATE INDEX "cotacoes_marca_idx" ON "cotacoes" ("marca");--> statement-breakpoint
CREATE INDEX "cotacoes_modelo_idx" ON "cotacoes" ("modelo");--> statement-breakpoint
CREATE INDEX "cotacoes_created_at_idx" ON "cotacoes" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_lower_unique" ON "usuarios" (lower("email"));--> statement-breakpoint
CREATE INDEX "usuarios_perfil_idx" ON "usuarios" ("perfil");--> statement-breakpoint
ALTER TABLE "cotacao_coberturas" ADD CONSTRAINT "cotacao_coberturas_cotacao_id_cotacoes_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cotacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "cotacao_coberturas" ADD CONSTRAINT "cotacao_coberturas_cobertura_id_coberturas_id_fkey" FOREIGN KEY ("cobertura_id") REFERENCES "coberturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_cliente_id_clientes_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX "clientes_nome_trgm_idx" ON "clientes" USING gin (lower("nome") gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "clientes_telefone_trgm_idx" ON "clientes" USING gin ("telefone" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "clientes_email_trgm_idx" ON "clientes" USING gin (lower("email") gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "cotacoes_marca_trgm_idx" ON "cotacoes" USING gin (lower("marca") gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "cotacoes_modelo_trgm_idx" ON "cotacoes" USING gin (lower("modelo") gin_trgm_ops);
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "set_updated_at"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "clientes_set_updated_at"
BEFORE UPDATE ON "clientes"
FOR EACH ROW
EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "cotacoes_set_updated_at"
BEFORE UPDATE ON "cotacoes"
FOR EACH ROW
EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "usuarios_set_updated_at"
BEFORE UPDATE ON "usuarios"
FOR EACH ROW
EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
INSERT INTO "coberturas" ("nome")
VALUES
  ('Roubo e Furto'),
  ('Colisão'),
  ('Danos a Terceiros'),
  ('Incêndio'),
  ('Carro Reserva'),
  ('Vidros'),
  ('Assistência 24 Horas'),
  ('Guincho'),
  ('Cobertura Completa')
ON CONFLICT ("nome") DO NOTHING;
--> statement-breakpoint
COMMENT ON TABLE "clientes" IS 'Clientes que solicitam cotações de seguros.';
--> statement-breakpoint
COMMENT ON TABLE "cotacoes" IS 'Solicitações de cotação para carro, moto ou caminhão.';
--> statement-breakpoint
COMMENT ON TABLE "coberturas" IS 'Catálogo de coberturas disponíveis para cotações.';
--> statement-breakpoint
COMMENT ON TABLE "cotacao_coberturas" IS 'Relacionamento muitos-para-muitos entre cotações e coberturas.';
--> statement-breakpoint
COMMENT ON TABLE "usuarios" IS 'Usuários autorizados a acessar o painel administrativo.';
--> statement-breakpoint
COMMENT ON COLUMN "usuarios"."senha_hash" IS 'Hash seguro da senha; nunca armazena senha em texto puro.';
