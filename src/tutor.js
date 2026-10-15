/* A beginner path layered onto the existing Clareia structure. No remote grading. */
const THREAD = JSON.parse($('#tutorData').textContent);
const THREAD_QUESTIONS = JSON.parse($('#tutorQuestions').textContent);
const TUTOR_STAGES = ['Entender', 'Visualizar', 'Diferenciar', 'Explicar', 'Conferir'];
const beforeTutorHome = renderHome, beforeTutorRoute = route, beforeTutorValid = valid;
let tutorIndex=0, tutorStep=0;

function normalizeTutor() {
  if(!S.tutor||typeof S.tutor!=='object'||Array.isArray(S.tutor))S.tutor={current:THREAD.lessons[0].id,lessons:{}};
  if(!S.tutor.lessons||typeof S.tutor.lessons!=='object'||Array.isArray(S.tutor.lessons))S.tutor.lessons={};
  if(!Array.isArray(S.tutor.history))S.tutor.history=[];
  if(!THREAD.lessons.some(l=>l.id===S.tutor.current))S.tutor.current=THREAD.lessons[0].id;
}
valid=function(s){
  if(!beforeTutorValid(s))return false;
  if(s.tutor===undefined)return true;
  const dict=x=>x&&typeof x==='object'&&!Array.isArray(x);
  if(!dict(s.tutor)||typeof s.tutor.current!=='string'||!dict(s.tutor.lessons))return false;
  if(s.tutor.history!==undefined&&(!Array.isArray(s.tutor.history)||!s.tutor.history.every(h=>dict(h)&&typeof h.lessonId==='string'&&typeof h.questionId==='string'&&Number.isInteger(h.choice)&&h.choice>=0&&h.choice<3&&typeof h.correct==='boolean'&&typeof h.followup==='boolean'&&Number.isFinite(h.at))))return false;
  return Object.values(s.tutor.lessons).every(r=>dict(r)&&Number.isInteger(r.step)&&r.step>=0&&r.step<5&&Number.isInteger(r.quizIndex)&&r.quizIndex>=0&&r.quizIndex<3&&dict(r.responses)&&typeof r.notes==='string'&&r.notes.length<=20000&&dict(r.feynman)&&typeof r.feynman.text==='string'&&r.feynman.text.length<=20000&&Array.isArray(r.feynman.checks)&&r.feynman.checks.length===3&&r.feynman.checks.every(v=>typeof v==='boolean')&&Object.values(r.responses).every(a=>dict(a)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<3&&typeof a.correct==='boolean'&&typeof a.passed==='boolean'&&(a.followupChoice===undefined||(Number.isInteger(a.followupChoice)&&a.followupChoice>=0&&a.followupChoice<3))));
};
if(!valid(S))delete S.tutor;
normalizeTutor();
function recordTutorAttempt(lessonId,questionId,choice,correct,followup=false){
  S.tutor.history.push({lessonId,questionId,choice,correct,followup,at:Date.now()});
  S.tutor.history=S.tutor.history.slice(-300);
}
function tutorRecord(id){
  normalizeTutor();
  if(!S.tutor.lessons[id])S.tutor.lessons[id]={step:0,quizIndex:0,responses:{},notes:'',feynman:{text:'',checks:[false,false,false]}};
  return S.tutor.lessons[id];
}
function feynmanReady(id){const r=S.tutor.lessons[id];return !!r&&r.feynman.text.trim().length>=12&&r.feynman.checks.every(Boolean);}
function tutorComplete(id){return feynmanReady(id)&&(THREAD_QUESTIONS[id]||[]).length===3&&THREAD_QUESTIONS[id].every(q=>S.tutor.lessons[id]?.responses[q.id]?.passed);}
function tutorUnlocked(){const first=THREAD.lessons.findIndex(l=>!tutorComplete(l.id));return first<0?THREAD.lessons.length-1:first;}
function tutorCompletionCount(){return THREAD.lessons.filter(l=>tutorComplete(l.id)).length;}
function tutorFocus(selector='#tutorTitle'){const h=$(selector);if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}

renderHome=function(){
  beforeTutorHome();normalizeTutor();
  const n=tutorCompletionCount(),id=S.tutor.current,l=THREAD.lessons.find(x=>x.id===id)||THREAD.lessons[0];
  $('#tutorEntry').innerHTML=`<div class="tutor-entry-copy"><span class="eyebrow">Comece do zero · seu novelo de lã</span><h2>Primeiro a relação.<br>Depois, o nome.</h2><p>Uma aula de cada vez: situação → resposta → consequência → o que muda depois. Conte uma história, compare e explique com suas palavras antes de avançar.</p><div class="row"><button class="btn primary" id="startTutor">${n?'Continuar meu fio':'Começar do zero'} →</button><span class="small">${n}/${THREAD.lessons.length} encontros conferidos</span></div></div><div class="tutor-entry-map" aria-label="Relação que orienta a análise"><span>O que veio antes?</span><b>↓</b><span>O que a pessoa fez?</span><b>↓</b><span>O que aconteceu depois?</span><b>↓</b><span>O responder mudou?</span></div><div class="tutor-resume"><span class="small">Próximo ponto: ${esc(l.title)}</span></div>${tutorHistoryHTML()}`;
  $('#startTutor').onclick=()=>openTutor();
  $$('[data-tutor-retake]').forEach(b=>b.onclick=()=>openTutor(+b.dataset.tutorRetake));
};
function tutorHistoryHTML(){
  const errors=S.tutor.history.filter(h=>!h.correct).slice(-6).reverse();
  return errors.length?`<details class="tutor-attempt-history"><summary>Diferenças que eu precisei retomar</summary>${errors.map(h=>{
    const i=THREAD.lessons.findIndex(l=>l.id===h.lessonId),q=THREAD_QUESTIONS[h.lessonId]?.find(q=>q.id===h.questionId);if(i<0||!q)return '';
    return `<button class="review-item" data-tutor-retake="${i}"><span>${esc(THREAD.lessons[i].title)}</span><small>${h.followup?'Verificação após ajuda':'Primeira situação'} · ${esc(q.trap)}</small></button>`;
  }).join('')}</details>`:'';
}
route=function(v){
  if(v==='tutor')renderTutor();
  beforeTutorRoute(v);
  if(v==='tutor'){
    $('#crumb').textContent='Sua jornada / Do zero, pelo fio condutor';
    $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view==='home'));
    tutorFocus();
  }
};
function openTutor(index=null){
  normalizeTutor();
  const desired=index===null?THREAD.lessons.findIndex(l=>l.id===S.tutor.current):index;
  tutorIndex=Math.max(0,Math.min(Number.isInteger(desired)?desired:0,tutorUnlocked()));
  const l=THREAD.lessons[tutorIndex];S.tutor.current=l.id;
  const r=tutorRecord(l.id);tutorStep=r.step;if(tutorStep===4&&!feynmanReady(l.id))tutorStep=3;
  persist();route('tutor');
}
function renderTutor(){
  normalizeTutor();const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id);
  $('#tutorTitle').textContent=l.title;
  $('#tutorPosition').textContent=`Encontro ${tutorIndex+1} de ${THREAD.lessons.length}`;
  $('#tutorOrigin').textContent=l.supplement?'Complemento conceitual didático · não atribuído aos slides como conteúdo original':'Reorganização didática dos materiais · exemplos novos identificados no texto';
  $('#tutorSteps').innerHTML=TUTOR_STAGES.map((t,i)=>`<button role="tab" class="micro-tab ${i===tutorStep?'selected':''}" data-tutor-stage="${i}" id="tutor-tab-${i}" aria-controls="tutorStage" aria-selected="${i===tutorStep}" tabindex="${i===tutorStep?'0':'-1'}" ${i===4&&!feynmanReady(l.id)?'disabled':''}>${i+1}. ${t}</button>`).join('');
  $$('[data-tutor-stage]').forEach(b=>{
    b.onclick=()=>setTutorStep(+b.dataset.tutorStage);
    b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const available=$$('[data-tutor-stage]').filter(x=>!x.disabled);const pos=available.indexOf(b);const next=e.key==='Home'?available[0]:e.key==='End'?available.at(-1):available[(pos+(e.key==='ArrowRight'?1:available.length-1))%available.length];const target=+next.dataset.tutorStage;setTutorStep(target);$('[data-tutor-stage="'+target+'"]').focus();}};
  });
  $('#tutorStepCount').textContent=`Passo ${tutorStep+1} de 5 · ${TUTOR_STAGES[tutorStep]}`;
  $('#tutorStage').setAttribute('aria-labelledby','tutor-tab-'+tutorStep);
  const unlocked=tutorUnlocked();
  $('#tutorOutline').innerHTML=THREAD.lessons.map((x,i)=>`<button class="lesson-chip ${i===tutorIndex?'selected':''}" data-tutor-concept="${i}" ${i>unlocked?'disabled':''} aria-current="${i===tutorIndex?'step':'false'}"><span>${tutorComplete(x.id)?'✓':String(i+1).padStart(2,'0')}</span>${esc(x.title)}${i>unlocked?'<small> · depois</small>':''}</button>`).join('');
  $$('[data-tutor-concept]').forEach(b=>b.onclick=()=>openTutor(+b.dataset.tutorConcept));
  $('#tutorNotes').value=r.notes;
  $('#tutorSources').innerHTML=(l.refs||[]).map(ref=>{const m=D.find(m=>m.id===ref.moduleId);return m?sourceLink(m,ref.pages):'';}).join('');bindSources();
  renderTutorStage();updateTutorNavigation();
}
function setTutorStep(step,moveFocus=false){
  const l=THREAD.lessons[tutorIndex];if(step===4&&!feynmanReady(l.id)){toast('Explique com suas palavras e confira os critérios antes das questões.');return;}
  tutorStep=Math.max(0,Math.min(step,4));tutorRecord(l.id).step=tutorStep;persist();renderTutor();
  if(moveFocus){tutorFocus('#tutorStage');$('#tutorStage').scrollIntoView({block:'start',behavior:'instant'});}
}
function updateTutorNavigation(){
  const l=THREAD.lessons[tutorIndex],complete=tutorComplete(l.id),ready=feynmanReady(l.id);
  const unlocked=tutorUnlocked();
  $$('[data-tutor-concept]').forEach(b=>{
    const index=+b.dataset.tutorConcept;b.disabled=index>unlocked;
    b.querySelector('span').textContent=tutorComplete(THREAD.lessons[index].id)?'✓':String(index+1).padStart(2,'0');
  });
  $('#tutorStepPrev').disabled=tutorStep===0;
  $('#tutorStepNext').hidden=tutorStep===4;
  $('#tutorStepNext').disabled=tutorStep===3&&!ready;
  $('#tutorStepNext').textContent=tutorStep===3?'Agora, três perguntas →':`Próximo: ${TUTOR_STAGES[tutorStep+1]} →`;
  $('#tutorConceptPrev').disabled=tutorIndex===0;
  $('#tutorConceptNext').disabled=!complete;
  $('#tutorConceptNext').textContent=complete?(tutorIndex===THREAD.lessons.length-1?'Voltar aos meus materiais →':'Continuar o fio →'):'Concluir as verificações para avançar';
  $('#tutorGateNote').textContent=complete?'Conferência concluída. Isso registra este percurso, sem garantir domínio em outros exemplos.':tutorStep===3?'Escreva primeiro. Depois, compare com os três critérios e indique os pontos presentes na sua explicação.':tutorStep===4?'Uma pergunta por vez. Se houver confusão, reconstruímos o mesmo conceito com outro exemplo antes de continuar.':'Você pode voltar e comparar a qualquer momento. Um novo conceito só será liberado após a explicação e as três verificações.';
}
$('#tutorBack').onclick=()=>route('home');
$('#tutorStepPrev').onclick=()=>setTutorStep(tutorStep-1,true);
$('#tutorStepNext').onclick=()=>setTutorStep(tutorStep+1,true);
$('#tutorConceptPrev').onclick=()=>openTutor(tutorIndex-1);
$('#tutorConceptNext').onclick=()=>{if(!tutorComplete(THREAD.lessons[tutorIndex].id))return;if(tutorIndex===THREAD.lessons.length-1)route('home');else openTutor(tutorIndex+1);};
$('#tutorNotes').oninput=e=>{tutorRecord(THREAD.lessons[tutorIndex].id).notes=e.target.value;persist();};

function renderTutorStage(){
  const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id);
  if(tutorStep===0){
    $('#tutorStage').innerHTML=`<div class="central-question"><span class="eyebrow">A pergunta de hoje</span><h2>${esc(l.question)}</h2></div><div class="connection-box"><span class="badge">Por que este conceito vem agora?</span><p>${esc(l.whyNow)}</p></div><h2 class="tutor-conversation">Vamos começar por uma situação concreta.</h2><p class="lead">${esc(l.simple)}</p><details class="tutor-detail"><summary>Agora, traduza para a linguagem da Psicologia</summary><p>${esc(l.technical)}</p></details>${tutorIndex===0?diagnosisHTML():''}`;
  }else if(tutorStep===1){
    $('#tutorStage').innerHTML=`<span class="eyebrow">Como funciona · um passo de cada vez</span><ol class="mechanism">${l.mechanism.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="thread-diagram" role="group" aria-label="Relação antes, resposta, consequência e responder futuro">${[['O que veio antes?',l.diagram.before],['R · O que a pessoa fez?',l.diagram.response],['O que veio depois?',l.diagram.consequence],['R futura · O que mudou?',l.diagram.after]].map(([t,s],i)=>`<div><span class="badge">${t}</span><p>${esc(s)}</p></div>${i<3?'<b aria-hidden="true">→</b>':''}`).join('')}</div><p class="small">${esc(l.diagram.caption)}</p><div class="story-box"><span class="badge">Uma mini-história didática</span><p>${esc(l.story.text)}</p><div id="storyEvents"></div><button class="btn" id="storyReveal">Explorar um momento →</button><p id="storyQuestion" hidden>${esc(l.story.question)}</p></div><details class="tutor-detail"><summary>Outra situação do cotidiano</summary><p>${esc(l.everyday)}</p></details><details class="tutor-detail"><summary>Na Psicologia ou na educação</summary><p>${esc(l.educational)}</p></details>${tutorIndex>=4&&tutorIndex<=11?formulaLabHTML():''}`;
    let shown=0;
    $('#storyReveal').onclick=()=>{
      if(shown>=l.story.events.length)return;
      const event=l.story.events[shown++];const p=document.createElement('p');p.className='story-event';const b=document.createElement('b');b.textContent=event.label+' · ';p.append(b,document.createTextNode(event.text));$('#storyEvents').append(p);
      if(shown===l.story.events.length){$('#storyReveal').disabled=true;$('#storyReveal').textContent='Agora, observe a relação';$('#storyQuestion').hidden=false;}
    };
    if($('#formulaObserve'))bindFormulaLab();
  }else if(tutorStep===2){
    $('#tutorStage').innerHTML=`<h2>O que muda entre estes conceitos?</h2><div class="tutor-comparison"><div><h3>${esc(l.comparison.leftTitle)}</h3><p>${esc(l.comparison.left)}</p></div><div><h3>${esc(l.comparison.rightTitle)}</h3><p>${esc(l.comparison.right)}</p></div></div><div class="connection-box"><span class="badge">A diferença está na função</span><p>${esc(l.comparison.functionalDifference)}</p></div><div class="counterexample-box"><span class="badge">Parece, mas não é</span><p>${esc(l.counterexample)}</p></div><div class="analogy-box"><span class="badge">Uma imagem para pensar</span><p>${esc(l.analogy)}</p><details><summary>Onde termina a analogia?</summary><p>${esc(l.analogyLimit)}</p></details></div><details class="tutor-detail exam-trap"><summary>Pegadinha de prova: onde posso me confundir?</summary><p>${esc(l.trap)}</p></details><div class="memory-phrase"><span class="badge">Uma frase para lembrar</span><p>${esc(l.memory)}</p></div>`;
  }else if(tutorStep===3){renderTutorFeynman();}
  else renderTutorQuestion();
}
function diagnosisHTML(){
  return `<details class="tutor-detail"><summary>Antes de começar: qual é o novelo deste material?</summary><h3>O caminho</h3><p>${esc(THREAD.intro.thread)}</p><h3>O que ajuda no começo</h3><ul>${THREAD.intro.prerequisites.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Confusões que vamos separar</h3><ul>${THREAD.intro.confusions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><details><summary>Ver todos os conceitos do percurso</summary><p>${THREAD.intro.concepts.map(esc).join(' → ')}</p></details></details>`;
}
function formulaLabHTML(){
  return `<div class="panel formula-lab"><span class="eyebrow">Primeiro a função · depois o nome</span><h3>R → consequência → R futura</h3><p class="small">R representa uma resposta. A última seta se refere à probabilidade futura de respostas semelhantes, em condições comparáveis. Esta é uma simulação conceitual, não um experimento.</p><div class="controls-grid"><div><label for="formulaChange">O que acontece depois de R?</label><select id="formulaChange"><option value="add">Um evento é adicionado (+)</option><option value="remove">Um evento é retirado (−)</option></select></div><div><label for="formulaEffect">Efeito atribuído à consequência nos dados</label><select id="formulaEffect"><option value="unknown">Ainda não há dados suficientes (?)</option><option value="up">Respostas semelhantes aumentam (↑)</option><option value="down">Respostas semelhantes diminuem (↓)</option><option value="same">Não foi observada mudança (=)</option></select></div></div><div class="formula" id="formulaObserve" aria-live="polite"></div><button class="btn" id="formulaName">O que podemos nomear?</button><div id="formulaFeedback" aria-live="polite"></div></div>`;
}
function bindFormulaLab(){
  const observe=()=>{const change=$('#formulaChange').value,effect=$('#formulaEffect').value;$('#formulaObserve').textContent=`R → ${change==='add'?'+':'−'} evento → R ${ {unknown:'?',up:'↑',down:'↓',same:'='}[effect] }`;$('#formulaFeedback').innerHTML='';};
  $('#formulaChange').onchange=observe;$('#formulaEffect').onchange=observe;observe();
  $('#formulaName').onclick=()=>{
    const add=$('#formulaChange').value==='add',effect=$('#formulaEffect').value;
    const title=effect==='up'?(add?'Reforçamento positivo':'Reforçamento negativo'):effect==='down'?(add?'Punição positiva, na definição funcional':'Punição negativa, na definição funcional'):effect==='same'?'Não há evidência de mudança neste recorte':'Ainda falta observar o efeito';
    const body=effect==='up'?'O fortalecimento da resposta é o ponto central. Positivo e negativo descrevem adição e retirada, não bom e ruim.':effect==='down'?'Aqui a simulação pressupõe dados que relacionam a diminuição à consequência. Diminuição isolada não prova punição. Nos slides, Skinner/Sidman definem punição pelo procedimento; essa definição não exige supressão definitiva.':'Uma consequência agradável por impressão ou um evento que apenas veio depois não basta para classificar a função. Investigue a relação e os dados.';
    $('#formulaFeedback').className='feedback';$('#formulaFeedback').innerHTML=`<strong>${title}</strong><p>${body}</p>`;
  };
}
function renderTutorFeynman(){
  const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id);
  $('#tutorStage').innerHTML=`<span class="eyebrow">Agora, você ensina a ideia</span><h2>${esc(l.feynman.prompt)}</h2><p>Tente explicar sem consultar, como se conversasse com alguém que nunca estudou o assunto. Uma frase clara com um exemplo vale mais que repetir o nome técnico.</p><form id="tutorFeynmanForm"><label for="tutorFeynmanAnswer">Minha explicação</label><textarea id="tutorFeynmanAnswer" required minlength="12" maxlength="20000" placeholder="O que acontece? O que muda? Qual exemplo ajuda a mostrar a diferença?"></textarea><button class="btn primary" type="submit">Conferir meu raciocínio</button></form><div id="tutorFeynmanFeedback" aria-live="polite"></div>`;
  $('#tutorFeynmanAnswer').value=r.feynman.text;
  $('#tutorFeynmanAnswer').oninput=e=>{r.feynman.text=e.target.value;r.feynman.checks=[false,false,false];$('#tutorFeynmanFeedback').innerHTML='';persist();updateTutorNavigation();$('#tutor-tab-4').disabled=true;};
  $('#tutorFeynmanForm').onsubmit=e=>{e.preventDefault();if(r.feynman.text.trim().length<12)return;showFeynmanRubric();};
  if(r.feynman.checks.some(Boolean))showFeynmanRubric();
}
function showFeynmanRubric(){
  const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id);
  $('#tutorFeynmanFeedback').className='feedback';
  $('#tutorFeynmanFeedback').innerHTML=`<strong>Compare sua explicação com estes pontos.</strong><p class="small">Conferência guiada: você indica os critérios presentes na resposta. O aplicativo não interpretou seu texto nem atribuiu uma nota automática.</p><p>${esc(l.feynman.model)}</p><fieldset class="rubric"><legend>Na minha explicação…</legend>${l.feynman.rubric.map((x,i)=>`<label class="checkbox"><input type="checkbox" data-feynman-check="${i}" ${r.feynman.checks[i]?'checked':''}>${esc(x)}</label>`).join('')}</fieldset><div id="feynmanParts" aria-live="polite"></div><button class="btn" id="feynmanRebuild">Preciso de outro exemplo</button>`;
  const parts=()=>{
    const yes=l.feynman.rubric.filter((x,i)=>r.feynman.checks[i]),missing=l.feynman.rubric.filter((x,i)=>!r.feynman.checks[i]);
    $('#feynmanParts').innerHTML=`${yes.length?`<p><b>Pela sua conferência, estes pontos estão presentes:</b></p><ul>${yes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${missing.length?`<p><b>Aqui ainda vale conferir ou reconstruir:</b></p><ul>${missing.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Você indicou os três critérios. Agora vamos verificar a diferença em situações objetivas, uma por vez.</p>'}`;
    $('#tutor-tab-4').disabled=!feynmanReady(l.id);updateTutorNavigation();
  };
  $$('[data-feynman-check]').forEach(b=>b.onchange=()=>{r.feynman.checks[+b.dataset.feynmanCheck]=b.checked;persist();parts();});
  $('#feynmanRebuild').onclick=()=>setTutorStep(2,true);parts();
}
function tutorFeedbackHTML(q,choice,followup=false){
  const item=followup?q.followup:q;const correct=choice===item.answer;
  return `<strong>${correct?'Você identificou a relação neste exemplo.':'Vamos separar a pista que confundiu a análise.'}</strong><p>${esc(item.rationales[choice])}</p>${!followup?`<details open class="reasoning"><summary>Como pensar, passo a passo</summary><ol>${q.reasoning.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><b>Pistas do enunciado</b><ul>${q.clues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details><details><summary>Por que cada alternativa funciona ou falha?</summary>${q.options.map((o,i)=>`<p><b>${'ABC'[i]} · ${esc(o)}</b><br>${esc(q.rationales[i])}</p>`).join('')}</details><p><b>Pegadinha:</b> ${esc(q.trap)}</p>`:''}`;
}
function renderTutorQuestion(){
  const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id),qs=THREAD_QUESTIONS[l.id];
  if(!feynmanReady(l.id)){$('#tutorStage').innerHTML='<p>Antes, escreva sua explicação e confira os três critérios no passo “Explicar”.</p>';return;}
  if(qs.every(q=>r.responses[q.id]?.passed)){renderTutorSummary();return;}
  r.quizIndex=Math.max(0,Math.min(r.quizIndex,2));
  const q=qs[r.quizIndex],a=r.responses[q.id];
  $('#tutorStage').innerHTML=`<div class="row spread"><span class="eyebrow">Uma pergunta de cada vez</span><span class="pill">${r.quizIndex+1} de 3</span></div><h2 id="tutorQuestionTitle" class="question">${esc(q.prompt)}</h2><p class="small">Primeiro identifique o que acontece e o que os dados permitem afirmar. Só então escolha o nome.</p><div class="choices">${q.options.map((o,i)=>`<button class="option" data-tutor-choice="${i}"><span class="letter">${'ABC'[i]}</span>${esc(o)}</button>`).join('')}</div><div id="tutorQuestionFeedback" aria-live="polite"></div><div id="tutorRemediation"></div><button class="btn primary" id="tutorQuestionNext" hidden>Próxima pergunta →</button>`;
  $$('[data-tutor-choice]').forEach(b=>b.onclick=()=>{
    if(r.responses[q.id])return;
    const choice=+b.dataset.tutorChoice,correct=choice===q.answer;
    r.responses[q.id]={choice,correct,passed:correct,at:Date.now()};recordTutorAttempt(l.id,q.id,choice,correct);persist();applyTutorAnswer(q);
  });
  $('#tutorQuestionNext').onclick=()=>{
    if(!r.responses[q.id]?.passed)return;
    const unfinished=qs.findIndex((x,i)=>i>r.quizIndex&&!r.responses[x.id]?.passed);
    r.quizIndex=unfinished>=0?unfinished:Math.max(0,qs.findIndex(x=>!r.responses[x.id]?.passed));persist();renderTutorQuestion();updateTutorNavigation();tutorFocus('#tutorQuestionTitle');
  };
  if(a)applyTutorAnswer(q);
}
function applyTutorAnswer(q){
  const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id),a=r.responses[q.id];if(!a)return;
  $$('[data-tutor-choice]').forEach(b=>{b.disabled=true;b.classList.toggle('correct',+b.dataset.tutorChoice===q.answer);b.classList.toggle('incorrect',!a.correct&&+b.dataset.tutorChoice===a.choice);});
  $('#tutorQuestionFeedback').className='feedback '+(a.correct?'good':'bad');
  $('#tutorQuestionFeedback').innerHTML=tutorFeedbackHTML(q,a.choice);
  $('#tutorQuestionNext').hidden=!a.passed;
  $('#tutorQuestionNext').textContent=r.quizIndex===2?'Concluir a revisão deste conceito →':'Próxima pergunta →';
  if(!a.correct){
    $('#tutorRemediation').innerHTML=`<div class="remediation"><span class="badge">Mesmo conceito · outra forma de olhar</span><p>${esc(q.rebuild)}</p><button class="btn" id="tutorTryOther">Tentar outra situação</button><button class="source-link" id="tutorBackToCompare">Voltar um passo para comparar</button></div><div id="tutorFollowupArea"></div>`;
    $('#tutorTryOther').onclick=()=>renderTutorFollowup(q);
    $('#tutorBackToCompare').onclick=()=>setTutorStep(2,true);
    if(a.followupChoice!==undefined)renderTutorFollowup(q);
  }
  updateTutorNavigation();tutorFocus('#tutorQuestionFeedback');
}
function renderTutorFollowup(q){
  const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id),a=r.responses[q.id],f=q.followup;
  $('#tutorFollowupArea').innerHTML=`<h3 id="tutorFollowupTitle">Um novo exemplo para a mesma distinção</h3><p>${esc(f.prompt)}</p><div class="choices">${f.options.map((o,i)=>`<button class="option" data-tutor-followup="${i}"><span class="letter">${'ABC'[i]}</span>${esc(o)}</button>`).join('')}</div><div id="tutorFollowupFeedback" aria-live="polite"></div><button class="btn" id="tutorRetryFollowup" hidden>Rever a distinção e refazer esta verificação</button>`;
  const show=()=>{
    const correct=a.followupChoice===f.answer;
    $$('[data-tutor-followup]').forEach(b=>{b.disabled=true;b.classList.toggle('correct',+b.dataset.tutorFollowup===f.answer);b.classList.toggle('incorrect',!correct&&+b.dataset.tutorFollowup===a.followupChoice);});
    $('#tutorFollowupFeedback').className='feedback '+(correct?'good':'bad');
    $('#tutorFollowupFeedback').innerHTML=tutorFeedbackHTML(q,a.followupChoice,true)+(correct?'<p class="small">Retomada registrada após ajuda. O erro inicial permanece no histórico; este acerto não equivale a domínio em qualquer situação.</p>':'<p>Volte à comparação do mesmo conceito. Não precisamos acrescentar termos novos para reconstruir esta diferença.</p>');
    $('#tutorRetryFollowup').hidden=correct;$('#tutorQuestionNext').hidden=!correct;updateTutorNavigation();tutorFocus('#tutorFollowupFeedback');
  };
  $$('[data-tutor-followup]').forEach(b=>b.onclick=()=>{if(a.followupChoice!==undefined)return;a.followupChoice=+b.dataset.tutorFollowup;a.passed=a.followupChoice===f.answer;a.helped=true;recordTutorAttempt(l.id,q.id,a.followupChoice,a.passed,true);persist();show();});
  $('#tutorRetryFollowup').onclick=()=>{delete a.followupChoice;a.passed=false;persist();renderTutorFollowup(q);};
  if(a.followupChoice!==undefined)show();else tutorFocus('#tutorFollowupTitle');
}
function renderTutorSummary(){
  const l=THREAD.lessons[tutorIndex],r=tutorRecord(l.id),questions=THREAD_QUESTIONS[l.id];
  $('#tutorStage').innerHTML=`<span class="eyebrow">O que você precisa realmente saber</span><h2 id="tutorSummaryTitle">Uma conexão reconstruída.</h2><p>Você conferiu sua explicação e respondeu às três situações. ${questions.filter(q=>r.responses[q.id]?.helped).length?'Houve retomadas com ajuda; elas continuam no histórico.':'Nesta rodada, os três exemplos foram identificados sem abrir as verificações de ajuda.'}</p><ul class="essentials">${l.essentials.slice(0,5).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="tutor-comparison"><div><h3>${esc(l.comparison.leftTitle)}</h3><p>${esc(l.comparison.left)}</p></div><div><h3>${esc(l.comparison.rightTitle)}</h3><p>${esc(l.comparison.right)}</p></div></div><div class="memory-phrase"><span class="badge">Frase para lembrar</span><p>${esc(l.memory)}</p></div><div class="connection-box"><span class="badge">Por que precisamos do próximo conceito?</span><p>${esc(l.next)}</p></div><details class="tutor-detail"><summary>Rever minhas três tentativas</summary>${questions.map(q=>{const a=r.responses[q.id];return `<p><b>${esc(q.prompt)}</b><br>Sua primeira escolha: ${esc(q.options[a.choice])}<br><span class="small">${a.correct?'Acerto inicial':'Retomada com ajuda'} · ${esc(q.rationales[a.choice])}</span></p>`;}).join('')}</details><div class="row"><button class="btn" id="tutorReviewLater">Relembrar antes de avançar</button><button class="btn" id="tutorRedoChecks">Refazer as três perguntas</button></div>`;
  $('#tutorReviewLater').onclick=()=>setTutorStep(3,true);
  $('#tutorRedoChecks').onclick=()=>{r.responses={};r.quizIndex=0;persist();renderTutorQuestion();updateTutorNavigation();tutorFocus('#tutorQuestionTitle');};
  updateTutorNavigation();tutorFocus('#tutorSummaryTitle');
}
renderHome();
