#!/usr/bin/env bash
# initial-commit.sh
# Use este script em sistemas Unix/WSL/macOS após instalar o Git.

if ! command -v git >/dev/null 2>&1; then
  echo "Git não encontrado. Instale o Git e execute este script novamente."
  exit 1
fi

# Ir para a pasta do script
cd "$(dirname "$0")"

# Inicializar repositório se não existir
test -d .git || git init

# Configurar nome/email se não definidos
if ! git config user.name >/dev/null; then
  git config user.name "Seu Nome"
  echo "Git user.name definido como 'Seu Nome' (altere com: git config user.name 'Seu Nome')"
fi
if ! git config user.email >/dev/null; then
  git config user.email "seu@email.com"
  echo "Git user.email definido como 'seu@email.com' (altere com: git config user.email 'seu@email.com')"
fi

# Adicionar e commitar
git add .
git commit -m "Initial commit: site + extensão WhatsApp"

echo "Commit inicial criado com sucesso."
