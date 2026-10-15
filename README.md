# Clareia — Análise do Comportamento

Aplicativo educacional em português, responsivo e sem dependências externas em tempo de execução. O HTML contém CSS, JavaScript, aulas, questões, transcrições e os sete PDFs originais. Não usa APIs nem envia anotações para serviços externos.

## Abrir

Abra `index.html` ou `Clareia-ABA.html` em um navegador. Para servir no ambiente de desenvolvimento:

```bash
cd /workspace/montanaro
python3 -m http.server 8000 --bind 0.0.0.0
```

O armazenamento de progresso depende da disponibilidade do localStorage do navegador e da origem usada. Exporte o progresso na página inicial antes de mudar de navegador ou limpar seus dados.

## O que está incluído

- 7 módulos, 37 aulas com indicação das páginas de origem e 38 questões comentadas.
- 9 experiências de laboratório: A–R–C, reforço/punição, extinção com gráfico manipulável, CCRs, role-play, modelagem, mando/tato, hexaflex e história.
- 37 cartões de revisão, notas por aula, progresso local e exportação/restauração JSON.
- Pesquisa no texto dos sete documentos, navegação por página e abertura/download dos PDFs completos.

| Material enviado | Páginas |
| --- | ---: |
| Introdução ABA e Modelo de Psicopatologia | 54 |
| Revisão de alguns Conceitos Básicos | 107 |
| História da Terapia Comportamental | 43 |
| Análise Funcional | 26 |
| Estratégias de Intervenção 1 | 35 |
| Estratégias de Intervenção 2 (Caso Clínico) | 42 |
| Revisão (Caso da Bia) | 34 |
| **Total** | **341** |

As aulas são sínteses e adaptações didáticas dos materiais enviados, atribuídos a Henrique F. R. Alves, com referências dos textos originais preservadas nos PDFs. Os casos de João de 55 e 31 anos são tratados separadamente. Os critérios APA (2002) do caso Bia são identificados como históricos. As atividades sobre casos são acadêmicas; não constituem diagnóstico ou intervenção individual. Gráficos simulados são explicitamente ilustrativos.

A transcrição pode omitir textos incorporados como imagens. Os PDFs preservam integralmente figuras, tabelas e conteúdo original; seus bytes foram comparados aos anexos por SHA-256.

## Editar e gerar o HTML

- `src/shell.html`: estrutura das telas.
- `src/styles.css`: estilos e responsividade.
- `src/app.js`: navegação, atividades e armazenamento.
- `src/course-data.json`: conteúdo e PDFs em base64.

Depois de editar:

```bash
python3 build.py
```

`index.html` é a saída canônica. `Clareia-ABA.html` é uma cópia para download, atualizada pelo mesmo build. Não é necessário npm install para usar ou gerar o aplicativo.

## Validação

Testado em Chromium desktop e viewport mobile de 390 × 844: renderização de todas as aulas, atividades, questões com feedback, revisão de erros, filtros, busca, download de PDF, exportação e persistência de progresso. O teste inicial identificou overflow na navegação das aulas mobile, que foi corrigido. A execução do HTML exportado também foi testada com rede offline, carregando seu conteúdo diretamente no navegador automatizado. A política do Chromium deste ambiente bloqueia navegação em URLs `file://`, portanto essa modalidade específica não pôde ser exercitada aqui.

Teste de navegação, com Playwright e Chromium disponíveis e servidor ativo:

```bash
node tests/browser.cjs
```

As capturas em `validation/` documentam a interface desktop e mobile. O teste escreve e apaga progresso apenas no navegador de teste.
