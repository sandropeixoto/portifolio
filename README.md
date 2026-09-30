# 🧠 Portfólio & Ecossistema GitHub - Sandro Peixoto

Aplicação interativa em HTML com **Mapa Mental Navegável** e visualização em grade com a análise profunda de stacks, dependências e arquiteturas de todos os repositórios da conta GitHub `sandropeixoto`.

---

## 🚀 Como Visualizar Localmente

Basta abrir o arquivo `index.html` em qualquer navegador:

```bash
open index.html
```

Ou executar com um servidor HTTP leve local:

```bash
npx serve . -p 3333
```
E acessar: `http://localhost:3333`

---

## ⚡ Como Funciona a Atualização Incremental (Zero Desperdício)

O ecossistema é mantido atualizado de forma inteligente pelo script `scripts/update_incremental.js` e pelo workflow do GitHub Actions (`.github/workflows/update-map.yml`).

### Princípios de Otimização:
1. **Verificação Delta Rápida:** O script faz apenas 1 requisição leve para verificar a data do último commit (`pushedAt`) de todos os repositórios.
2. **Atualização Cirúrgica:** Se nada foi alterado, o script encerra em menos de 4 segundos. Se apenas 1 repositório teve push, **apenas esse repositório** é consultado a fundo via GraphQL.
3. **Regeneração Automática:** Os arquivos `data/repos_analyzed.json` e `index.html` são atualizados e commitados automaticamente pela Action.

---

## 🔄 Três Formas de Disparar Atualizações

### 1. Automático por Agendamento (Cron)
O workflow roda automaticamente todo dia às **06:00 UTC** via GitHub Actions, verificando se há novos commits em qualquer projeto.

### 2. Manual pela Interface do GitHub
1. Acesse a aba **Actions** neste repositório.
2. Selecione o workflow **Atualizar Portfólio & Mapa Mental**.
3. Clique em **Run workflow**. (Você pode deixar o campo vazio para verificar tudo ou informar o nome exato de um repositório).

### 3. Em Tempo Real no Push de Qualquer Outro Repositório
Para que um projeto atualize o portfólio no momento exato em que você fizer push na branch principal (`main`), adicione o seguinte step no workflow existente daquele projeto:

```yaml
- name: 🔔 Notificar Portfólio
  if: github.ref == 'refs/heads/main'
  run: |
    gh api repos/sandropeixoto/portifolio/dispatches \
      -f event_type=repo_updated \
      -f client_payload[repo]="${{ github.event.repository.name }}"
  env:
    GH_TOKEN: ${{ secrets.PAT_UPDATE_PORTFOLIO }}
```

*(Nota: Crie um Personal Access Token (PAT) com escopo `repo` e salve-o como Secret com o nome `PAT_UPDATE_PORTFOLIO`).*

---

## 📁 Estrutura de Arquivos

```
portifolio/
├── .github/
│   └── workflows/
│       └── update-map.yml          # GitHub Action com triggers agendado, manual e por evento
├── scripts/
│   ├── update_incremental.js       # Mecanismo de sincronização delta / cirúrgica
│   └── generate_html.js            # Gerador do mapa mental HTML a partir do dataset
├── data/
│   └── repos_analyzed.json         # Base de dados estruturada com os 114 repositórios
├── index.html                      # Interface web moderna com o Mapa Mental navegável
├── .gitignore
└── README.md
```
