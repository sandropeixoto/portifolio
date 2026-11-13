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
1. **Verificação Delta Rápida:** O script faz apenas 1 requisição leve para verificar a data do último commit (`pushedAt`) e metadados de todos os repositórios.
2. **Atualização Cirúrgica:** Se nada foi alterado, o script encerra em menos de 4 segundos. Se apenas 1 repositório teve push, **apenas esse repositório** é consultado a fundo via GraphQL.
3. **Novos repositórios e limpeza:** Repositórios novos são incluídos automaticamente e repositórios excluídos ou renomeados são removidos da base na próxima execução. A varredura agendada ocorre a cada 6 horas (`23 */6 * * *` UTC).
4. **Regeneração Automática:** Os arquivos `data/repos_analyzed.json` e `index.html` são atualizados e commitados automaticamente pela Action.

### Acesso aos repositórios

A Action usa o secret `PAT_UPDATE_PORTFOLIO` para listar e analisar os repositórios da conta, inclusive os privados. Configure esse secret nas configurações deste repositório com um Personal Access Token que tenha acesso aos repositórios desejados (token clássico com escopo `repo`, ou token fine-grained configurado com **All repositories** e permissões de leitura de metadados e conteúdo). Para também enviar notificações `repository_dispatch` com um token fine-grained, conceda `Contents: write` no repositório do portfólio. O `GITHUB_TOKEN` padrão da Action só acessa este repositório e não consegue descobrir todos os repositórios privados da conta.

---

## 🔄 Formas de Disparar Atualizações

### 1. Automático por Agendamento (Cron)
O workflow roda automaticamente a cada **6 horas** (`00:23`, `06:23`, `12:23` e `18:23` UTC) via GitHub Actions, verificando se há novos repositórios, exclusões/renomeações ou novos commits em qualquer projeto.

### 2. Manual pela Interface do GitHub
1. Acesse a aba **Actions** neste repositório.
2. Selecione o workflow **Atualizar Portfólio & Mapa Mental**.
3. Clique em **Run workflow**. (Você pode deixar o campo vazio para verificar tudo ou informar o nome exato de um repositório).

### 3. Atualização imediata após push em outro repositório
O agendamento diário descobre repositórios novos na próxima varredura. Para atualizar logo após um push na branch principal (`main`), adicione o seguinte step no workflow existente daquele projeto:

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

O mesmo secret `PAT_UPDATE_PORTFOLIO` precisa estar configurado neste repositório e nos projetos que farão a notificação. A notificação por push só funciona nos projetos em que esse step foi instalado; a varredura diária continua cobrindo repositórios sem ele.

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
│   └── repos_analyzed.json         # Base de dados estruturada com os repositórios analisados
├── index.html                      # Interface web moderna com o Mapa Mental navegável
├── .gitignore
└── README.md
```
