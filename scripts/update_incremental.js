const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.resolve(__dirname, '..');
const dataFile = path.join(baseDir, 'data', 'repos_analyzed.json');
const targetRepoFromEnv = (process.env.TARGET_REPO || '').trim();

if (!fs.existsSync(dataFile)) {
  console.error(`Erro: Arquivo base não encontrado em ${dataFile}`);
  process.exit(1);
}

const localRepos = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const localMap = new Map(localRepos.map(r => [r.name, r]));

console.log(`📡 Verificando repositórios remotos para a conta sandropeixoto...`);

// 1. Obter lista remota leve (apenas 1 chamada da API)
let remoteRepos = [];
try {
  const cmd = 'gh repo list sandropeixoto --limit 200 --json name,pushedAt,description,url,isPrivate,isFork,primaryLanguage,createdAt,updatedAt';
  remoteRepos = JSON.parse(execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }));
} catch (err) {
  console.error('Falha ao listar repositórios via gh CLI:', err.message);
  process.exit(1);
}

// 2. Identificar repositórios que precisam de atualização
let reposToUpdate = [];

if (targetRepoFromEnv) {
  console.log(`🎯 Alvo específico definido: ${targetRepoFromEnv}`);
  reposToUpdate = remoteRepos.filter(r => r.name.toLowerCase() === targetRepoFromEnv.toLowerCase());
  if (reposToUpdate.length === 0) {
    console.log(`Aviso: Repositório ${targetRepoFromEnv} não foi encontrado na listagem remota.`);
  }
} else {
  reposToUpdate = remoteRepos.filter(remote => {
    const local = localMap.get(remote.name);
    if (!local) return true; // Repositório novo no GitHub
    // Compara timestamp de push
    const remotePush = new Date(remote.pushedAt || 0).getTime();
    const localPush = new Date(local.pushedAt || 0).getTime();
    return remotePush > localPush;
  });
}

if (reposToUpdate.length === 0) {
  console.log('✅ Nenhum repositório foi alterado desde a última sincronização. Nada a fazer.');
  process.exit(0);
}

console.log(`⚡ Repositórios que precisam de atualização (${reposToUpdate.length}):`, reposToUpdate.map(r => r.name));

// Funções auxiliares de extração e classificação
function parsePackageJson(text) {
  if (!text) return null;
  try {
    const pkg = JSON.parse(text);
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    return {
      name: pkg.name,
      version: pkg.version,
      type: pkg.type,
      scripts: Object.keys(pkg.scripts || {}),
      deps: Object.keys(deps),
      allDeps: deps
    };
  } catch (e) {
    return null;
  }
}

function parseComposerJson(text) {
  if (!text) return null;
  try {
    const comp = JSON.parse(text);
    const deps = { ...(comp.require || {}), ...(comp['require-dev'] || {}) };
    return {
      name: comp.name,
      description: comp.description,
      deps: Object.keys(deps)
    };
  } catch (e) {
    return null;
  }
}

function parseRequirements(text) {
  if (!text) return [];
  return text.split('\n')
    .map(l => l.trim().split(/[=><~]/)[0].trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('-r'));
}

function extractReadmeSummary(text) {
  if (!text) return '';
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('![') && !l.startsWith('[!') && !l.startsWith('<') && !l.startsWith('```') && !l.startsWith('---'));
  if (lines.length > 0) {
    let summary = lines.slice(0, 3).join(' ');
    if (summary.length > 220) summary = summary.substring(0, 217) + '...';
    return summary;
  }
  return '';
}

function detectTechStack(repo, pkgs, composers, reqsLists, pubspecData, files, languagesData) {
  const frameworks = new Set();
  const libraries = new Set();
  const tools = new Set();
  const databases = new Set();
  const cloud = new Set();

  const fileNames = (files?.entries || []).map(e => e.name);

  const allPkgDeps = [];
  pkgs.forEach(p => { if (p && p.deps) allPkgDeps.push(...p.deps); });
  const allCompDeps = [];
  composers.forEach(c => { if (c && c.deps) allCompDeps.push(...c.deps); });
  const allReqs = [];
  reqsLists.forEach(r => { if (Array.isArray(r)) allReqs.push(...r); });

  // Frontend Frameworks
  if (allPkgDeps.includes('next') || fileNames.some(f => f.startsWith('next.config'))) frameworks.add('Next.js');
  if (allPkgDeps.includes('react')) frameworks.add('React');
  if (allPkgDeps.includes('vue') || fileNames.some(f => f.startsWith('nuxt.config'))) frameworks.add('Vue.js');
  if (allPkgDeps.includes('nuxt')) frameworks.add('Nuxt.js');
  if (allPkgDeps.includes('astro') || fileNames.some(f => f.startsWith('astro.config'))) frameworks.add('Astro');
  if (allPkgDeps.includes('svelte')) frameworks.add('Svelte');
  if (allPkgDeps.includes('vite') || fileNames.some(f => f.startsWith('vite.config'))) frameworks.add('Vite');
  if (allPkgDeps.includes('@remix-run/react')) frameworks.add('Remix');

  // Styling & UI
  if (allPkgDeps.includes('tailwindcss') || allPkgDeps.includes('@tailwindcss/vite') || fileNames.some(f => f.startsWith('tailwind.config'))) libraries.add('Tailwind CSS');
  if (allPkgDeps.includes('bootstrap')) libraries.add('Bootstrap');
  if (allPkgDeps.includes('lucide-react')) libraries.add('Lucide Icons');
  if (allPkgDeps.includes('motion') || allPkgDeps.includes('framer-motion')) libraries.add('Framer Motion');
  if (allPkgDeps.some(d => d.startsWith('@radix-ui'))) libraries.add('Radix UI');
  if (allPkgDeps.includes('@mui/material')) libraries.add('Material UI');

  // Backend / Server JS/TS
  if (allPkgDeps.includes('express')) frameworks.add('Express');
  if (allPkgDeps.includes('fastify')) frameworks.add('Fastify');
  if (allPkgDeps.includes('@nestjs/core')) frameworks.add('NestJS');
  if (allPkgDeps.includes('hono')) frameworks.add('Hono');

  // PHP
  if (allCompDeps.includes('laravel/framework') || fileNames.includes('artisan')) frameworks.add('Laravel');
  if (allCompDeps.includes('slim/slim')) frameworks.add('Slim');
  if (allCompDeps.some(d => d.startsWith('symfony/'))) frameworks.add('Symfony');

  // Python
  if (allReqs.some(r => r.toLowerCase().includes('fastapi'))) frameworks.add('FastAPI');
  if (allReqs.some(r => r.toLowerCase().includes('flask'))) frameworks.add('Flask');
  if (allReqs.some(r => r.toLowerCase().includes('django')) || fileNames.includes('manage.py')) frameworks.add('Django');
  if (allReqs.some(r => r.toLowerCase().includes('mediapipe') || r.toLowerCase().includes('opencv'))) tools.add('Computer Vision');

  // Mobile / Desktop
  if (pubspecData || fileNames.includes('pubspec.yaml')) frameworks.add('Flutter');
  if (allPkgDeps.includes('react-native')) frameworks.add('React Native');
  if (allPkgDeps.includes('expo')) frameworks.add('Expo');
  if (allPkgDeps.includes('electron')) frameworks.add('Electron');

  // Databases & ORMs
  if (allPkgDeps.includes('@prisma/client') || allPkgDeps.includes('prisma')) databases.add('Prisma ORM');
  if (allPkgDeps.includes('drizzle-orm')) databases.add('Drizzle ORM');
  if (allPkgDeps.includes('mongoose') || allPkgDeps.includes('mongodb')) databases.add('MongoDB');
  if (allPkgDeps.includes('pg') || allReqs.some(r => r.includes('psycopg'))) databases.add('PostgreSQL');
  if (allPkgDeps.includes('mysql2') || allCompDeps.includes('doctrine/dbal') || fileNames.some(f => f.includes('mysql'))) databases.add('MySQL');
  if (allPkgDeps.includes('better-sqlite3') || allPkgDeps.includes('sqlite3') || fileNames.some(f => f.includes('.sqlite'))) databases.add('SQLite');
  if (allPkgDeps.includes('@supabase/supabase-js')) databases.add('Supabase');

  // Cloud & BaaS
  if (fileNames.includes('firebase.json') || fileNames.includes('.firebaserc') || allPkgDeps.includes('firebase') || allPkgDeps.includes('firebase-admin')) {
    cloud.add('Firebase');
  }
  if (fileNames.some(f => f.startsWith('wrangler')) || allPkgDeps.includes('wrangler') || allPkgDeps.includes('@cloudflare/workers-types')) {
    cloud.add('Cloudflare Workers');
  }
  if (fileNames.includes('Dockerfile') || fileNames.includes('docker-compose.yml') || fileNames.includes('docker-compose.yaml') || fileNames.some(f => f.startsWith('Dockerfile.'))) {
    tools.add('Docker');
  }
  if (fileNames.includes('vercel.json')) cloud.add('Vercel');
  if (fileNames.includes('netlify.toml')) cloud.add('Netlify');

  // AI & Services
  if (allPkgDeps.includes('openai') || allReqs.some(r => r.toLowerCase().includes('openai'))) tools.add('OpenAI API');
  if (allPkgDeps.some(d => d.includes('genai') || d.includes('generative-ai')) || allReqs.some(r => r.toLowerCase().includes('google-generativeai'))) {
    tools.add('Google Gemini AI');
  }
  if (allPkgDeps.includes('@anthropic-ai/sdk')) tools.add('Claude AI');
  if (allPkgDeps.includes('resend') || allReqs.some(r => r.toLowerCase().includes('resend'))) tools.add('Resend Email');
  if (allPkgDeps.includes('stripe')) tools.add('Stripe');
  if (allPkgDeps.includes('whatsapp-web.js') || allPkgDeps.includes('@whiskeysockets/baileys') || (repo.description && repo.description.toLowerCase().includes('w-api')) || fileNames.some(f => f.includes('uazapi'))) {
    tools.add('WhatsApp API');
  }

  const languages = (languagesData?.edges || []).map(edge => ({
    name: edge.node.name,
    size: edge.size
  }));
  const totalBytes = languages.reduce((acc, l) => acc + l.size, 0);
  const languagesWithPercent = languages.map(l => ({
    ...l,
    percentage: totalBytes > 0 ? Number(((l.size / totalBytes) * 100).toFixed(1)) : 0
  }));

  const meaningfulPkg = allPkgDeps.filter(d => !d.startsWith('@types/') && !['typescript', 'prettier', 'eslint', 'autoprefixer', 'postcss'].includes(d));
  const topDeps = Array.from(new Set([...meaningfulPkg, ...allReqs, ...allCompDeps])).slice(0, 12);

  return {
    primaryLanguage: repo.primaryLanguage?.name || (languages[0]?.name) || 'N/A',
    languages: languagesWithPercent,
    frameworks: Array.from(frameworks),
    libraries: Array.from(libraries),
    databases: Array.from(databases),
    cloud: Array.from(cloud),
    tools: Array.from(tools),
    keyDependencies: topDeps,
    rootFiles: fileNames
  };
}

function categorizeRepo(repo, techStack, effectiveDescription) {
  const name = repo.name.toLowerCase();
  const desc = (effectiveDescription || '').toLowerCase();
  const tools = techStack.tools || [];
  const fws = techStack.frameworks || [];
  const lang = techStack.primaryLanguage;

  // 1. Mobile
  if (fws.includes('Flutter') || fws.includes('React Native') || lang === 'Dart') {
    return 'Mobile & Multiplataforma';
  }

  // 2. Sites Institucionais & Landing Pages
  if (name.startsWith('site-') || desc.includes('landing page') || desc.includes('institucional') || desc.includes('https://') || name.includes('linktree') || name.includes('links')) {
    return 'Sites Institucionais & Portais';
  }

  // 3. Gestão Pública & Corporativa
  if (name.includes('sepam') || name.includes('saude') || name.includes('gestao') || name.includes('contratacoes') || name.includes('contrato') || name.includes('pestalozzi') || name.includes('auragov') || name.includes('gestorgov') || name.includes('clubsync') || name.includes('associa') || name.includes('voto') || name.includes('axis') || desc.includes('gestão') || desc.includes('processos administrativos')) {
    return 'Sistemas de Gestão & Governança';
  }

  // 4. Comunicação, WhatsApp & Mensageria
  if (name.includes('whatsapp') || name.includes('zap') || name.includes('resend') || name.includes('telegram') || desc.includes('whatsapp') || desc.includes('telegram') || desc.includes('w-api') || desc.includes('uazapi')) {
    return 'Comunicação, Automação & Bots';
  }

  // 5. Inteligência Artificial (Produtos/Ferramentas cujo core é IA)
  if (name.includes('cabine-de-fotos') || name.includes('ia') || name.includes('agent') || name.includes('nanovoice') || name.includes('thinking-to-youtube') || desc.includes('inteligência artificial generativa') || desc.includes('ia generativa') || tools.includes('OpenAI API') || tools.includes('Computer Vision') || (tools.includes('Google Gemini AI') && (name.includes('ai') || desc.includes('ia') || desc.includes('agente')))) {
    return 'Inteligência Artificial & Agentes';
  }

  // 6. Ferramentas, Utilitários & Desktop
  if (name.includes('cli') || name.includes('tool') || name.includes('cofre') || name.includes('btcview') || name.includes('monitor') || name.includes('converter') || name.includes('enhancer') || fws.includes('Electron')) {
    return 'Ferramentas, CLIs & Utilitários';
  }

  // 7. Backends & APIs
  if (lang === 'PHP' || (lang === 'Python' && !fws.includes('React') && !fws.includes('Next.js')) || fws.includes('FastAPI') || fws.includes('Flask') || (fws.includes('Express') && !fws.includes('React') && !fws.includes('Vite'))) {
    return 'Backends, APIs & Serviços';
  }

  // 8. Aplicações Web & SaaS
  if (fws.includes('React') || fws.includes('Next.js') || fws.includes('Vite') || lang === 'TypeScript' || lang === 'JavaScript') {
    return 'Aplicações Web & SaaS';
  }

  return 'Outros Projetos';
}

// 3. Processar apenas os repositórios alterados em lotes de 6
const BATCH_SIZE = 6;
for (let i = 0; i < reposToUpdate.length; i += BATCH_SIZE) {
  const chunk = reposToUpdate.slice(i, i + BATCH_SIZE);
  console.log(`Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(reposToUpdate.length / BATCH_SIZE)}...`);

  const queryParts = chunk.map((repo, idx) => `
    r${idx}: repository(owner: "sandropeixoto", name: "${repo.name}") {
      pkg: object(expression: "HEAD:package.json") { ... on Blob { text } }
      pkgFront: object(expression: "HEAD:frontend/package.json") { ... on Blob { text } }
      pkgBack: object(expression: "HEAD:backend/package.json") { ... on Blob { text } }
      pkgFunc: object(expression: "HEAD:functions/package.json") { ... on Blob { text } }
      composer: object(expression: "HEAD:composer.json") { ... on Blob { text } }
      composerBack: object(expression: "HEAD:backend/composer.json") { ... on Blob { text } }
      reqs: object(expression: "HEAD:requirements.txt") { ... on Blob { text } }
      reqsBack: object(expression: "HEAD:backend/requirements.txt") { ... on Blob { text } }
      pubspec: object(expression: "HEAD:pubspec.yaml") { ... on Blob { text } }
      readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
      files: object(expression: "HEAD:") { ... on Tree { entries { name } } }
      languages(first: 6, orderBy: {field: SIZE, direction: DESC}) {
        edges { size node { name } }
      }
    }
  `).join('\n');

  const fullQuery = `query { ${queryParts} }`;

  try {
    const output = execSync('gh api graphql --input -', {
      input: JSON.stringify({ query: fullQuery }),
      encoding: 'utf8',
      timeout: 30000
    });
    const parsed = JSON.parse(output);
    const data = parsed.data || {};

    chunk.forEach((repo, idx) => {
      const repoData = data[`r${idx}`] || {};
      const pkgs = [
        parsePackageJson(repoData.pkg?.text),
        parsePackageJson(repoData.pkgFront?.text),
        parsePackageJson(repoData.pkgBack?.text),
        parsePackageJson(repoData.pkgFunc?.text)
      ].filter(Boolean);

      const composers = [
        parseComposerJson(repoData.composer?.text),
        parseComposerJson(repoData.composerBack?.text)
      ].filter(Boolean);

      const reqsLists = [
        parseRequirements(repoData.reqs?.text),
        parseRequirements(repoData.reqsBack?.text)
      ].filter(r => r.length > 0);

      const pubspecText = repoData.pubspec?.text || null;
      const files = repoData.files;
      const languagesData = repoData.languages;
      const readmeSummary = extractReadmeSummary(repoData.readme?.text);
      const effectiveDescription = repo.description || readmeSummary;

      const techStack = detectTechStack(repo, pkgs, composers, reqsLists, pubspecText, files, languagesData);
      const category = categorizeRepo(repo, techStack, effectiveDescription);

      const updatedObj = {
        name: repo.name,
        url: repo.url,
        isPrivate: repo.isPrivate,
        isFork: repo.isFork,
        description: repo.description || '',
        readmeSummary,
        effectiveDescription,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
        pushedAt: repo.pushedAt,
        category,
        techStack
      };

      localMap.set(repo.name, updatedObj);
      console.log(`  ✓ Atualizado: ${repo.name} [${category}]`);
    });
  } catch (err) {
    console.error(`Erro ao processar lote:`, err.message);
  }
}

// 4. Salvar base atualizada
const finalData = Array.from(localMap.values());
fs.writeFileSync(dataFile, JSON.stringify(finalData, null, 2), 'utf8');
console.log(`💾 Base atualizada com sucesso (${finalData.length} repositórios).`);

// 5. Regerar HTML
try {
  execSync(`node "${path.join(__dirname, 'generate_html.js')}"`, { stdio: 'inherit' });
} catch (err) {
  console.error('Erro ao regerar index.html:', err.message);
}
