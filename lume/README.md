# Lume — uma leitura de cada vez

Aplicativo em português para estudar artigos científicos, especialmente durante a graduação em Psicologia. Inclui percurso em etapas curtas, conceitos explicados, flashcards, teste rápido, anotações, leitura em voz alta e temporizador opcional.

## Baixar e abrir

[Baixar Lume-Artigos.html](https://github.com/raphaelmontanaro-debug/montanaro/raw/refs/heads/main/lume/Lume-Artigos.html). Salve o arquivo e abra no Chrome, Edge ou Firefox. Se o GitHub mostrar o código, use o botão **Download raw file**. Não é necessário instalar Node para usar esse arquivo.

- Cole o artigo ou importe TXT/Markdown para estudar localmente.
- PDFs precisam de conexão para carregar o leitor PDF.js da CDN jsDelivr. O arquivo é processado no navegador, sem upload do PDF para a CDN. PDFs escaneados precisam de OCR externo. Limites: 20 MB, 100 páginas e 150.000 caracteres.
- Comece pelo exemplo fictício para conhecer o percurso. Ele não representa uma pesquisa publicada.
- Artigos, notas e progresso ficam neste navegador. Use **Salvar cópia** para exportar a biblioteca e restaurá-la em outro navegador. O aplicativo não sincroniza dispositivos.

## Três formas de estudar

**Local:** organiza trechos do original, identifica alguns termos e oferece perguntas de leitura. É uma organização extrativa; não promete interpretar automaticamente resultados ou traduzir artigos.

**Com o ChatGPT:** abra um artigo, clique em **Explicar com IA**, copie o pedido com o texto, cole no ChatGPT e importe o JSON respondido. O Lume verifica a estrutura e as citações antes de aplicar o guia. Não há integração automática com sua assinatura do ChatGPT.

**Com API:** a versão com servidor abaixo permite gerar um guia dentro do aplicativo, usando uma chave própria da OpenAI. O uso da API tem cobrança separada e não está configurado neste repositório. Nenhuma chave acompanha o código.

Guias de IA podem conter erros. A verificação de citações não comprova que todas as interpretações estão corretas. Confira o original. O app distingue o essencial para começar e os detalhes para aprofundar, sem descartar método ou limitações. Não é ferramenta clínica e não garante benefício para TDAH.

## Código-fonte e servidor local opcional

Baixe o repositório pelo GitHub (**Code → Download ZIP**) e entre nesta pasta `lume`. Requer Node.js 22 ou superior. Não há dependências npm para instalar.

```sh
npm start
```

Abra `http://localhost:4173`. O servidor escuta somente na interface local. Para alterar a porta, configure `PORT`.

Para habilitar a API, copie `.env.example` para `.env` e preencha `OPENAI_API_KEY` com sua chave. Reinicie com `npm start`. A chave fica no servidor e não é exposta ao navegador; nunca envie `.env` ao GitHub. O modelo padrão é `gpt-4.1-mini`; pode ser alterado por `OPENAI_MODEL`.

Ao clicar em **Gerar explicação didática**, o texto é enviado à API da OpenAI, com `store:false`. A cobrança e as políticas do serviço continuam aplicáveis. O servidor valida limites, resposta estruturada e correspondência de citações; devolve erros sem detalhes de credenciais.

## Arquivos

- `Lume-Artigos.html`: versão independente para baixar.
- `dist/`: interface, guia demonstrativo e motor de leitura local.
- `server.mjs`: servidor local e integração opcional com a API.
- `scripts/build-standalone.mjs`: gera `releases/Lume-Artigos.html` a partir dos fontes.
- `engine.test.js` e `server.test.mjs`: verificações do motor e servidor.

```sh
npm run build
npm test
```

O motor passou em 11 testes automatizados, incluindo fidelidade de trechos, ausência de resultados inventados e validação de guias. Os testes de servidor e a validação visual em navegador ficaram pendentes nesta entrega por restrição do ambiente de execução. A API real não foi acionada sem chave configurada.

## Exportar e restaurar

A cópia JSON guarda artigo, guia, anotações, revisão e progresso. Na biblioteca, **Salvar cópia** exporta todos os artigos. Em Preferências, **Restaurar cópia** adiciona os estudos sem apagar os atuais. **Exportar estudo** também gera Markdown, útil para leitura fora do aplicativo. Limite de 20 artigos por biblioteca; a capacidade real depende do armazenamento do navegador.

A leitura em voz alta depende das vozes disponíveis no navegador e sistema. Exportações e exemplos não incluem seu diagnóstico ou dados pessoais predefinidos.
