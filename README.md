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

- Mesma estrutura visual e navegação da primeira versão: 7 módulos e os 7 PDFs preservados.
- 37 microlições conectadas, cada uma em seis etapas: explorar, aprender, visualizar, comparar, recuperar e revisar.
- Pergunta central, conhecimentos prévios, explicação intuitiva e aprofundada, analogia com limites, exemplo/contraexemplo, recuperação ativa e até cinco ideias essenciais por aula.
- Três confusões conceituais por módulo, com explicação e critérios para distingui-las.
- 111 desafios guiados: três por aula, nos níveis fundamentos, conexões e aprofundamento. As 38 questões anteriores continuam disponíveis em modo separado.
- Respostas objetivas com pistas, raciocínio, comentário de cada alternativa e nova pergunta após dificuldades.
- Respostas abertas com rubrica, modelo comentado e **autoavaliação identificada**, sem simular correção semântica por IA.
- Adaptação por regras: dificuldades abrem outro exemplo e uma pergunta de consolidação; o próximo nível depende de acerto objetivo ou conferência declarada pelo estudante.
- Modo foco persistente, revelação progressiva e navegação das etapas por teclado.
- Caderno de dificuldades e sugestões ajustáveis de revisão em 1, 3 ou 7 dias, com prática intercalada entre blocos.
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
- `src/course-data.json`: conteúdo original e PDFs em base64, preservados integralmente.
- `src/learning-data.json`: conexões, analogias, contraexemplos, recuperação e confusões conceituais.
- `src/assessment-data.json`: 111 desafios, raciocínio, rubricas e perguntas de consolidação.
- `src/learning.js`: microlições, prática guiada, revisões e compatibilidade de progresso.
- `docs/learning-guidelines.md`: instruções de aprendizagem fornecidas pelo usuário.

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
node tests/learning.cjs
```

A atualização também foi validada com restauração do progresso anterior, seis etapas por microlição, 111 desafios guiados, consolidação após dificuldades, conferência por rubricas, modo foco, revisões agendadas e feedback mobile sem transbordamento. As capturas em `validation/` documentam a interface desktop e mobile. O teste escreve e apaga progresso apenas no navegador de teste.

## Atualização sem perder seus estudos

A nova versão usa a mesma chave de armazenamento `clareia-aba-v2` e aceita exportações antigas de progresso. Ao mudar o nome/local do HTML ou trocar de navegador, o armazenamento pode ser separado pela política do navegador: exporte seus estudos na versão anterior e restaure o JSON na nova versão.

As datas sugeridas são exibidas no fuso de São Paulo. Os intervalos são pontos de partida ajustáveis: não prometem retenção nem medem domínio, e não pressupõem que uma técnica funcione igualmente para todas as pessoas com TDAH. A conclusão de uma aula, o acerto de múltipla escolha e a autoavaliação de uma explicação são indicadores distintos.
