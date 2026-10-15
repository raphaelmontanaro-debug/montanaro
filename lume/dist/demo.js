import { validateGuide } from './engine.js';

export const DEMO_TITLE = 'Pausas breves e compreensão de textos em universitários';

// Original teaching material, deliberately not presented as a published paper.
export const DEMO_TEXT = `Pausas breves e compreensão de textos em universitários
MATERIAL FICTÍCIO PARA DEMONSTRAÇÃO — Este texto foi criado exclusivamente para ensinar leitura científica. Não corresponde a uma pesquisa real, não tem autores, periódico ou DOI e não deve ser citado como evidência.

Resumo
Este estudo fictício investigou se duas pausas breves durante uma tarefa de leitura estavam associadas a diferenças na compreensão imediata de um texto. Noventa e seis estudantes universitários foram distribuídos aleatoriamente entre uma condição de leitura com pausas e uma condição de leitura contínua. A compreensão foi avaliada por 12 questões sobre o texto. A média foi de 8,1 acertos na condição com pausas e 7,0 na condição contínua, com diferença estimada de 1,1 acerto, p = 0,03 e tamanho de efeito d = 0,44. Os dados ilustrativos se referem a uma única tarefa e não permitem concluir sobre aprendizagem duradoura ou tratamento de TDAH.

Introdução
A leitura acadêmica exige selecionar informações, relacionar ideias e monitorar a própria compreensão. A atenção sustentada pode variar com a dificuldade do texto, o contexto e o tempo de atividade. Pausas curtas são uma estratégia possível de organização da tarefa, mas sua utilidade precisa ser avaliada em condições específicas. Uma pontuação em compreensão não representa, sozinha, toda a capacidade de atenção de uma pessoa.

Objetivo
O objetivo deste exercício fictício foi comparar a compreensão imediata de um texto entre universitários que realizaram duas pausas de um minuto e universitários que leram de forma contínua. A hipótese ilustrativa era de que a condição com pausas teria uma média maior de acertos.

Método
Participaram 96 estudantes de graduação de uma única universidade, recrutados por conveniência. A amostra não foi selecionada para representar todas as pessoas universitárias. Não houve avaliação diagnóstica de TDAH nem formação de um grupo clínico.
Uma distribuição aleatória alocou 48 participantes em cada condição. Todos leram o mesmo texto de divulgação científica, em ambiente silencioso, com 24 minutos totais de leitura. Na condição com pausas, a leitura ocorreu em três blocos de oito minutos, separados por duas pausas de um minuto, sem uso de celular. Na condição contínua, a leitura ocorreu em um único bloco de 24 minutos. Assim, o tempo total decorrido foi de 26 minutos na condição com pausas e 24 minutos na condição contínua.
Imediatamente após a tarefa, os participantes responderam a 12 questões de compreensão. A pontuação variava de zero a 12 acertos e foi a medida principal. Também informaram a distração percebida em uma escala de um a cinco; esse autorrelato foi uma medida secundária. O exercício comparou as médias de compreensão e apresentou um tamanho de efeito padronizado. Não foi realizado acompanhamento posterior.

Resultados
A média de compreensão foi de 8,1 acertos entre os participantes da condição com pausas e de 7,0 acertos entre os participantes da condição contínua. A diferença estimada foi de 1,1 acerto, com p = 0,03 e tamanho de efeito padronizado d = 0,44. Estes números são inteiramente fictícios e servem apenas para exercitar a interpretação.
A distração percebida teve médias descritivas de 3,0 na condição com pausas e 3,5 na condição contínua. Não foi apresentado teste inferencial para essa medida secundária. Portanto, a diferença descritiva não deve ser tratada como evidência de um efeito estatisticamente demonstrado na distração. Não foram fornecidos intervalos de confiança neste exercício.

Discussão
Neste exemplo, a condição com pausas apresentou maior média de compreensão imediata. A distribuição aleatória fortalece a comparação entre as condições dentro do experimento, mas não transforma os participantes em uma amostra representativa. Além disso, as condições diferiram no tempo total decorrido e na organização temporal da leitura; o desenho não permite separar completamente esses componentes.
Um valor de p de 0,03 não significa 97% de probabilidade de a hipótese estar correta. O tamanho de efeito de 0,44 descreve uma diferença padronizada e precisa de contexto e de uma estimativa de incerteza para ser interpretado. O resultado é sobre uma tarefa específica, e não sobre a eficácia de uma estratégia para qualquer pessoa.

Limitações
As principais limitações deste exercício são a amostra por conveniência de uma única universidade, a realização de uma única tarefa, a ausência de acompanhamento e a diferença de dois minutos no tempo total decorrido entre as condições. O autorrelato de distração pode sofrer influência da memória e das expectativas dos participantes. A ausência de intervalos de confiança limita a avaliação da precisão das estimativas. Como não houve avaliação diagnóstica, não é possível tirar conclusões específicas sobre pessoas com TDAH.

Conclusão
O exemplo mostra uma diferença de compreensão imediata favorável à condição com pausas nas condições descritas. Pesquisas reais precisariam replicar o achado, igualar o tempo total entre condições, incluir diferentes populações e avaliar retenção em outros momentos. Este material não fundamenta recomendações clínicas e não representa evidência científica real.`;

export const DEMO_GUIDE = validateGuide({
  title: DEMO_TITLE,
  overview: 'E se duas pausas curtas ajudassem a acompanhar um texto? Neste exemplo fictício, 96 universitários leram com pausas ou de forma contínua. O grupo com pausas acertou, em média, 1,1 questão a mais em uma avaliação imediata. O ponto principal é aprender a ligar pergunta, método, resultado e limites — sem transformar um exemplo em uma regra para a vida. Este material foi criado para demonstração e não é uma pesquisa publicada.',
  mode: 'demo',
  sections: [
    {
      id: 'panorama', title: 'Primeiro, a ideia central', question: 'Qual é a história deste estudo?', priority: 'essential',
      summary: 'A pergunta é simples: organizar uma leitura com duas pausas muda a compreensão logo depois? Neste exercício, o grupo com pausas teve maior média de acertos. Antes de pensar em “funciona para mim?”, precisamos entender como a comparação foi feita e o que ela consegue mostrar.',
      keyPoints: ['Entenda agora: a pesquisa compara duas formas de organizar a mesma tarefa.', 'O resultado principal é compreensão imediata, medida por questões sobre o texto.', 'Guarde este cuidado: o artigo é fictício. Ele ensina a ler evidências, mas não é evidência real sobre pausas ou TDAH.'],
      quote: 'Os dados ilustrativos se referem a uma única tarefa e não permitem concluir sobre aprendizagem duradoura ou tratamento de TDAH.',
      sourceLabel: 'Resumo · material fictício',
    },
    {
      id: 'pergunta', title: 'A pergunta que guia tudo', question: 'O que os autores querem descobrir?', priority: 'essential',
      summary: 'O objetivo é comparar a média de compreensão em duas condições: leitura com duas pausas de um minuto e leitura contínua. A hipótese é uma previsão feita antes de olhar o resultado: esperar uma média maior no grupo com pausas. Objetivo é a pergunta; hipótese é a resposta que se espera testar.',
      keyPoints: ['Quem: universitários da amostra estudada.', 'O que muda: a organização temporal da leitura, com ou sem pausas.', 'O que é medido: número de acertos em 12 questões, imediatamente após ler.'],
      quote: 'O objetivo deste exercício fictício foi comparar a compreensão imediata de um texto entre universitários que realizaram duas pausas de um minuto e universitários que leram de forma contínua.',
      sourceLabel: 'Objetivo · material fictício',
    },
    {
      id: 'metodo', title: 'Por dentro do método', question: 'Como foi feita uma comparação justa?', priority: 'essential',
      summary: 'Os 96 participantes foram divididos por sorteio em dois grupos de 48. Todos tiveram 24 minutos de leitura do mesmo texto. Um grupo leu em três blocos de oito minutos, com duas pausas entre eles; o outro leu continuamente. O sorteio ajuda a comparar as condições. Porém, não torna a amostra representativa de todos os universitários.',
      keyPoints: ['Amostra por conveniência: vieram de uma única universidade, sem seleção para representar toda a população.', 'Medida principal: 0 a 12 acertos em compreensão imediata. Distração percebida é uma medida secundária, por autorrelato.', 'Detalhe que faz diferença: com as pausas, decorreram 26 minutos; sem elas, 24. O desenho mistura pausas e tempo total decorrido.'],
      quote: 'Assim, o tempo total decorrido foi de 26 minutos na condição com pausas e 24 minutos na condição contínua.',
      sourceLabel: 'Método · material fictício',
    },
    {
      id: 'resultados', title: 'Traduzindo os resultados', question: 'O que esses números querem dizer?', priority: 'essential',
      summary: 'Na prova de 12 questões, a média foi 8,1 com pausas e 7,0 sem pausas: diferença de 1,1 acerto. São médias de grupos; não significa que toda pessoa melhorou exatamente 1,1 questão. O valor de p e o tamanho de efeito ajudam a descrever a análise, mas não estabelecem sozinhos a importância prática nem a precisão da diferença.',
      keyPoints: ['p = 0,03: sob a hipótese nula e as suposições do teste, dados tão ou mais incompatíveis com ela seriam pouco frequentes. Não significa 97% de chance de a hipótese estar certa.', 'd = 0,44: diferença em uma escala padronizada. Seu significado depende do contexto; os intervalos de confiança não foram fornecidos.', 'A distração teve apenas médias descritivas. Não há teste que sustente afirmar um efeito estatisticamente demonstrado nessa medida.'],
      quote: 'A diferença estimada foi de 1,1 acerto, com p = 0,03 e tamanho de efeito padronizado d = 0,44.',
      sourceLabel: 'Resultados · números fictícios',
    },
    {
      id: 'limites', title: 'O que ainda não sabemos', question: 'Até onde dá para levar a conclusão?', priority: 'essential',
      summary: 'A conclusão vale para a comparação feita neste exercício. Não sabemos se o mesmo ocorreria em outras universidades, com outros textos ou depois de uma semana. A compreensão foi avaliada logo após ler; isso não é o mesmo que aprendizagem duradoura. Também não houve avaliação diagnóstica de TDAH.',
      keyPoints: ['Não confunda sorteio dos grupos com amostra representativa: são etapas diferentes da pesquisa.', 'Pausas e tempo total decorrido variaram juntos. Não dá para separar completamente qual componente explica a diferença.', 'Nada neste material permite concluir sobre tratamento de TDAH. O próprio estudo e seus números são fictícios.'],
      quote: 'Como não houve avaliação diagnóstica, não é possível tirar conclusões específicas sobre pessoas com TDAH.',
      sourceLabel: 'Limitações · material fictício',
    },
    {
      id: 'conexoes', title: 'Faça a ideia virar conhecimento', question: 'Como explicar o estudo com suas palavras?', priority: 'deepen',
      summary: 'Tente dizer em voz alta: “Neste exemplo fictício, universitários sorteados para ler com duas pausas tiveram maior média de compreensão imediata. Como os grupos também diferiram no tempo total e não houve acompanhamento, a conclusão precisa ficar dentro dessas condições.” Se você explica isso sem olhar, já conectou as partes essenciais.',
      keyPoints: ['Revisão em um minuto: pergunta → comparação → medida → diferença → limite.', 'Para aprofundar depois: leia sobre randomização, tamanho de efeito e intervalo de confiança. Volte ao método para entender por que essas ideias importam.', 'Próximo estudo possível: igualar o tempo total entre as condições e avaliar compreensão novamente em outro dia.'],
      quote: 'Pesquisas reais precisariam replicar o achado, igualar o tempo total entre condições, incluir diferentes populações e avaliar retenção em outros momentos.',
      sourceLabel: 'Conclusão · material fictício',
    },
  ],
  glossary: [
    { term: 'Amostra', definition: 'Conjunto de pessoas ou observações que participou do estudo. É uma parte da população que queremos compreender.', example: 'Neste exemplo: 96 estudantes de uma universidade, não todos os universitários.' },
    { term: 'Randomização', definition: 'Distribuição por sorteio entre as condições de uma pesquisa. Ajuda a reduzir diferenças prévias sistemáticas, sem garantir grupos idênticos.', example: 'Aqui, 48 participantes foram alocados a cada condição. Isso não torna o recrutamento por conveniência representativo.' },
    { term: 'Operacionalização', definition: 'Forma concreta escolhida para observar ou medir um conceito abstrato.', example: '“Compreensão” foi representada pelo número de acertos em 12 questões. Essa prova não mede tudo o que compreender pode significar.' },
    { term: 'Atenção sustentada', definition: 'Capacidade de manter o envolvimento em uma atividade ao longo do tempo. Ela varia conforme a pessoa, a tarefa e o contexto.', example: 'Acompanhar uma sequência de argumentos durante uma leitura. O estudo não mediu diretamente todos os processos de atenção.' },
    { term: 'Autorrelato', definition: 'Informação fornecida pela própria pessoa sobre sua experiência. Pode ser útil e também sofrer influência de memória e expectativas.', example: 'Marcar de 1 a 5 quanto se sentiu distraído é diferente de registrar cada distração por observação.' },
    { term: 'Valor de p', definition: 'Sob a hipótese nula e as suposições do teste, é a probabilidade de observar dados tão ou mais incompatíveis com essa hipótese quanto os obtidos.', example: 'p = 0,03 não é a probabilidade de a hipótese ser falsa, nem significa que ela tem 97% de chance de estar correta.' },
    { term: 'Tamanho de efeito', definition: 'Medida da magnitude de uma diferença ou relação. Uma diferença padronizada permite descrevê-la em uma escala comum, mas ainda exige contexto.', example: 'O d = 0,44 do exemplo não significa 44% de melhora e não informa sozinho a importância prática.' },
    { term: 'Intervalo de confiança', definition: 'Faixa produzida por um procedimento de estimação com uma cobertura especificada em repetições. Ajuda a avaliar a precisão de uma estimativa.', example: 'O exercício não forneceu esse intervalo. Por isso, não podemos descrever com ele a precisão da diferença de 1,1 acerto.' },
  ],
  flashcards: [
    { question: 'Qual é a pergunta central do exemplo?', answer: 'Se a compreensão imediata de um texto difere entre universitários que leem com duas pausas de um minuto e universitários que leem continuamente.' },
    { question: 'O que foi medido como compreensão?', answer: 'O número de acertos em 12 questões respondidas imediatamente após a leitura. Essa medida não representa toda a aprendizagem ou toda a atenção de uma pessoa.' },
    { question: 'Qual foi a diferença principal entre as médias?', answer: '8,1 acertos com pausas e 7,0 na leitura contínua: diferença estimada de 1,1 acerto em 12 questões. Todos esses números são fictícios.' },
    { question: 'Por que randomizar não torna a amostra representativa?', answer: 'O sorteio distribui os participantes que já entraram no estudo entre os grupos. Representatividade depende de como foram recrutados em relação à população.' },
    { question: 'p = 0,03 significa 97% de chance de a hipótese estar certa?', answer: 'Não. O valor de p se refere à compatibilidade dos dados com a hipótese nula sob as suposições do teste; não é uma probabilidade atribuída à hipótese dos autores.' },
    { question: 'Qual detalhe do tempo complica a interpretação?', answer: 'As duas condições tiveram 24 minutos de leitura, mas o tempo total decorrido foi 26 minutos com pausas e 24 sem pausas. Assim, pausas e tempo total não foram separados completamente.' },
    { question: 'O exemplo permite concluir que pausas tratam TDAH?', answer: 'Não. Não houve avaliação diagnóstica, grupo clínico ou acompanhamento. Além disso, trata-se de material fictício, sem valor de evidência real.' },
    { question: 'O que um próximo estudo poderia melhorar?', answer: 'Igualar o tempo total entre as condições, estudar populações e tarefas diferentes e medir retenção em outro momento, além de apresentar a incerteza das estimativas.' },
  ],
  quiz: [
    { question: 'Qual foi a medida principal do exemplo?', options: ['Diagnóstico de TDAH.', 'Acertos em 12 questões de compreensão imediata.', 'Notas do semestre inteiro.'], correct: 1, explanation: 'A compreensão foi operacionalizada como número de acertos logo após ler. Não houve avaliação diagnóstica nem medida de notas.' },
    { question: 'O que podemos dizer sobre os 1,1 acerto de diferença?', options: ['Toda pessoa melhorou exatamente 1,1 acerto.', 'O grupo com pausas teve uma média 1,1 acerto maior.', 'A atenção melhorou 110%.'], correct: 1, explanation: 'É uma diferença entre médias de grupos. Ela não descreve o resultado individual de cada participante e não é uma porcentagem de melhora na atenção.' },
    { question: 'O sorteio dos participantes entre as condições ajuda principalmente a…', options: ['Tornar a amostra representativa de toda a população.', 'Garantir que os grupos sejam perfeitamente iguais.', 'Reduzir diferenças prévias sistemáticas entre os grupos.'], correct: 2, explanation: 'Randomização ajuda a comparar condições, mas não garante igualdade perfeita nem corrige o recrutamento por conveniência.' },
    { question: 'Por que a duração total é uma limitação relevante?', options: ['Porque o grupo com pausas teve 26 minutos decorridos e o contínuo, 24.', 'Porque nenhum grupo teve tempo definido.', 'Porque os grupos leram por números diferentes de horas.'], correct: 0, explanation: 'O tempo de leitura foi igual, mas o tempo total decorrido diferiu. O desenho não separa completamente a organização das pausas desse tempo adicional.' },
    { question: 'Qual afirmação sobre p = 0,03 é correta?', options: ['Prova que a estratégia funciona para todas as pessoas.', 'Não fornece a probabilidade de a hipótese dos autores ser verdadeira.', 'Significa que o efeito foi de 3%.'], correct: 1, explanation: 'O valor de p depende da hipótese nula e das suposições do teste. Ele não é tamanho de efeito, garantia de generalização ou probabilidade da hipótese.' },
    { question: 'Qual é a conclusão mais fiel ao material?', options: ['Pausas são um tratamento comprovado de TDAH.', 'Não há nenhuma diferença entre as médias descritas.', 'O exemplo fictício descreve maior compreensão imediata com pausas, dentro de condições e limites específicos.'], correct: 2, explanation: 'Essa frase preserva o achado descrito e seus limites. O material foi criado para aprender a ler pesquisas e não constitui evidência científica real.' },
  ],
  limitations: [
    'Material inteiramente fictício, criado para demonstração. Não é artigo publicado e não deve ser citado como evidência.',
    'Amostra por conveniência de uma universidade, tarefa única e compreensão avaliada apenas imediatamente após a leitura.',
    'As condições diferem no tempo total decorrido; o desenho não separa completamente pausas e tempo adicional.',
    'Não houve avaliação diagnóstica de TDAH. O exemplo não sustenta recomendações clínicas ou conclusões sobre um grupo clínico.',
    'Não foram apresentados intervalos de confiança. A medida secundária de distração teve somente médias descritivas.',
  ],
}, DEMO_TEXT);

export const demoArticle = { title: DEMO_TITLE, text: DEMO_TEXT };
export const demoGuide = DEMO_GUIDE;
export default DEMO_GUIDE;
