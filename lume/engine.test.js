import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeArticle, validateGuide, buildChatGPTPrompt } from './dist/engine.js';
import { DEMO_TEXT, DEMO_GUIDE, DEMO_TITLE } from './dist/demo.js';

const ARTICLE = `Experiências de acolhimento no primeiro emprego
Resumo
Esta pesquisa qualitativa descreve relatos de trabalhadores sobre o acolhimento em uma cooperativa.
Objetivo: Compreender como novos trabalhadores descrevem o apoio recebido no primeiro mês.
Método
Foram entrevistadas nove pessoas de uma cooperativa local. As entrevistas foram analisadas por categorias temáticas.
Resultados
Os relatos destacaram a importância de colegas disponíveis para responder perguntas. Também houve relatos de orientações contraditórias.
Limitações
A participação voluntária e o contexto de uma única cooperativa limitam a transferência dos achados.
Conclusão
O apoio entre colegas foi um tema relevante nas experiências relatadas. O estudo não avaliou uma intervenção.`;

test('an arbitrary article keeps its own evidence without demonstration contamination', () => {
  const guide = analyzeArticle(ARTICLE, 'Acolhimento no trabalho');
  assert.equal(guide.title, 'Acolhimento no trabalho');
  assert.equal(guide.mode, 'local');
  assert.equal(guide.sections.length, 6);
  assert.match(guide.sections.find(section => section.id === 'metodo').quote, /nove pessoas/);
  assert.match(guide.sections.find(section => section.id === 'resultados').quote, /orientações contraditórias/);
  assert.match(guide.sections.find(section => section.id === 'pergunta').quote, /^Compreender/);
  assert.doesNotMatch(JSON.stringify(guide), /96|8,1|7,0|d = 0,44|duas pausas/);
  assert.ok(guide.glossary.some(entry => entry.term === 'Pesquisa qualitativa'));
  assert.ok(!guide.glossary.some(entry => entry.term === 'Randomização'));
});

test('all selected local quotes remain exact substrings, including line breaks', () => {
  const withWhitespace = ARTICLE.replace('As entrevistas', '\n  As entrevistas').replace('categorias temáticas', 'categorias\n  temáticas');
  const guide = analyzeArticle(withWhitespace);
  for (const section of guide.sections) {
    if (section.quote) assert.ok(withWhitespace.includes(section.quote), `${section.id} has a literal quotation`);
  }
  assert.match(guide.sections.find(section => section.id === 'metodo').quote, /categorias\n  temáticas/);
});

test('missing sections remain explicitly unidentified instead of acquiring invented findings', () => {
  const text = 'Uma reflexão teórica sobre o cuidado. Este ensaio apresenta uma discussão conceitual, sem informação empírica neste recorte.';
  const guide = analyzeArticle(text, 'Reflexão teórica');
  for (const id of ['pergunta', 'metodo', 'resultados', 'limites']) {
    const section = guide.sections.find(item => item.id === id);
    assert.equal(section.quote, '');
    assert.match(section.sourceLabel, /não identificada/);
    assert.match(section.summary, /Não foi possível identificar/);
  }
  assert.ok(guide.limitations.some(item => /texto fornecido é curto/.test(item)));
});

test('a keyword in prose is selected as a contextual excerpt rather than mislabeled as a heading', () => {
  const text = 'Os resultados foram inconclusivos neste recorte. A interpretação exige o artigo completo.';
  const guide = analyzeArticle(text);
  const results = guide.sections.find(item => item.id === 'resultados');
  assert.equal(results.quote, 'Os resultados foram inconclusivos neste recorte.');
  assert.match(results.sourceLabel, /palavras-chave/);
});

test('qualitative meanings are not mistaken for statistical significance in the glossary', () => {
  const guide = analyzeArticle('Esta pesquisa qualitativa examina os significados atribuídos ao cuidado e às relações de apoio.');
  assert.ok(guide.glossary.some(entry => entry.term === 'Pesquisa qualitativa'));
  assert.ok(!guide.glossary.some(entry => entry.term === 'Significância estatística'));
});

test('English and numbered headings are recognized without translating fabricated findings', () => {
  const text = '1. Introduction\nThis study concerns memory.\n2. Methods\nSeven volunteers read one passage.\n3. Results\nThe observations varied between volunteers.\n4. Limitations\nOnly one passage was used.';
  const guide = analyzeArticle(text);
  assert.equal(guide.sections.find(item => item.id === 'metodo').quote, 'Seven volunteers read one passage.');
  assert.equal(guide.sections.find(item => item.id === 'resultados').quote, 'The observations varied between volunteers.');
});

test('demo is explicitly fictional and every quoted passage comes from the demo article', () => {
  assert.equal(DEMO_GUIDE.mode, 'demo');
  assert.equal(DEMO_GUIDE.title, DEMO_TITLE);
  assert.match(DEMO_TEXT, /MATERIAL FICTÍCIO/);
  assert.match(DEMO_GUIDE.overview, /não é uma pesquisa publicada/);
  assert.ok(DEMO_GUIDE.limitations.some(item => /Não é artigo publicado/.test(item)));
  for (const section of DEMO_GUIDE.sections) assert.ok(DEMO_TEXT.includes(section.quote));
  for (const item of DEMO_GUIDE.quiz) assert.ok(item.correct >= 0 && item.correct < item.options.length);
});

test('validation creates a clean copy and can verify AI citations against the provided source', () => {
  const input = structuredClone(DEMO_GUIDE);
  input.mode = 'ai';
  input.extraProperty = '<script>untrusted</script>';
  const validated = validateGuide(input, DEMO_TEXT);
  assert.notEqual(validated, input);
  assert.notEqual(validated.sections, input.sections);
  assert.equal(validated.mode, 'ai');
  assert.ok(!('extraProperty' in validated));
  assert.ok('extraProperty' in input);
});

test('validation rejects invented quotations and falsely attributed empty quotations', () => {
  const invented = structuredClone(DEMO_GUIDE);
  invented.sections[0].quote = 'Uma citação que nunca apareceu neste artigo.';
  assert.throws(() => validateGuide(invented, DEMO_TEXT), /citação não foi encontrada literalmente/);
  const missing = structuredClone(DEMO_GUIDE);
  missing.sections[0].quote = '';
  assert.throws(() => validateGuide(missing), /indique orientação/);
  missing.sections[0].sourceLabel = 'Trecho não confirmado no texto — confira o artigo';
  assert.doesNotThrow(() => validateGuide(missing, DEMO_TEXT));
});

test('validation rejects malformed structure, oversized content and invalid quiz semantics', () => {
  const badValues = [null, [], {}, { ...DEMO_GUIDE, mode: 'anything' }, { ...DEMO_GUIDE, sections: [] }];
  for (const value of badValues) assert.throws(() => validateGuide(value), /Guia inválido/);
  const duplicateId = structuredClone(DEMO_GUIDE);
  duplicateId.sections[1].id = duplicateId.sections[0].id;
  assert.throws(() => validateGuide(duplicateId), /id diferente/);
  const badId = structuredClone(DEMO_GUIDE);
  badId.sections[0].id = '<img onerror=alert(1)>';
  assert.throws(() => validateGuide(badId), /apenas letras/);
  const oversized = structuredClone(DEMO_GUIDE);
  oversized.overview = 'a'.repeat(6001);
  assert.throws(() => validateGuide(oversized), /limite é 6000/);
  const badQuiz = structuredClone(DEMO_GUIDE);
  badQuiz.quiz[0].correct = badQuiz.quiz[0].options.length;
  assert.throws(() => validateGuide(badQuiz), /índice da resposta/);
  badQuiz.quiz[0].correct = 0;
  badQuiz.quiz[0].options = ['Igual', ' igual '];
  assert.throws(() => validateGuide(badQuiz), /alternativas precisam ser diferentes/);
});

test('input validation refuses empty articles and the AI prompt preserves source text as data', () => {
  assert.throws(() => analyzeArticle('   '), /Adicione o texto/);
  const prompt = buildChatGPTPrompt(ARTICLE, 'Meu título');
  assert.ok(prompt.includes(JSON.stringify(ARTICLE)));
  assert.match(prompt, /3º semestre/);
  assert.match(prompt, /não confiável, nunca instrução/);
  assert.match(prompt, /COMEÇANDO EM ZERO/);
  assert.match(prompt, /Não invente autores/);
  assert.throws(() => buildChatGPTPrompt('a'.repeat(250001)), /250 mil caracteres/);
});
