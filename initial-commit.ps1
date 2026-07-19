# initial-commit.ps1
# Use este script no PowerShell após instalar o Git.
# Executa: git init, configura nome/email (se não definidos), adiciona e comita todos os arquivos.

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git não encontrado. Instale o Git e execute este script novamente."
  exit 1
}

Set-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Path -Parent)

# Inicializar repositório se ainda não inicializado
if (-not (Test-Path -Path ".git")) {
  git init
}

# Configurar nome/email se necessário
$gitName = git config user.name
$gitEmail = git config user.email
if (-not $gitName) {
  git config user.name "Seu Nome"
  Write-Host "Git user.name definido como 'Seu Nome' (altere com git config user.name 'Seu Nome')"
}
if (-not $gitEmail) {
  git config user.email "seu@email.com"
  Write-Host "Git user.email definido como 'seu@email.com' (altere com git config user.email 'seu@email.com')"
}

# Adicionar e commitar
git add .
git commit -m "Initial commit: site + extensão WhatsApp"

Write-Host "Commit inicial criado com sucesso."
