const {chromium}=require('playwright');
const fs=require('fs');
const base=process.env.CLAREIA_URL||'http://127.0.0.1:8000';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))external.push(r.url());});
 const check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS',msg);};
 await page.addInitScript(()=>{if(!localStorage.getItem('tutor-test-seed')){localStorage.setItem('clareia-aba-v2',JSON.stringify({done:['aba-1'],notes:{'aba-1':'Nota da versão anterior'},answers:{},last:null}));localStorage.setItem('tutor-test-seed','1');}});
 await page.goto(base);
 check(await page.locator('#modules .module').count()===7,'sete módulos anteriores mantidos');
 check(await page.locator('nav button').count()===5,'estrutura de navegação preservada');
 check(await page.locator('#doneCount').textContent()==='1/37','progresso antigo preservado no novo percurso');
 await page.locator('#startTutor').click();
 check(await page.locator('#tutor').isVisible(),'aula do zero abre pela jornada');
 check(await page.evaluate(()=>THREAD.lessons.length)===18,'fio tem 18 encontros conectados');
 check(await page.locator('[data-tutor-concept="1"]').isDisabled(),'novo conceito aguarda conferência anterior');
 check(await page.locator('#tutorConceptNext').isDisabled(),'avanço bloqueado antes da aprendizagem ativa');
 check(await page.locator('[data-tutor-stage="4"]').isDisabled(),'três questões aguardam explicação Feynman');
 check(await page.locator('#tutorStage .lead').isVisible(),'explicação simples vem primeiro');
 await page.locator('#tutorStage .tutor-detail summary').first().click();
 check((await page.locator('#tutorStage').textContent()).includes(await page.evaluate(()=>THREAD.lessons[0].technical)),'definição técnica acessível por revelação');
 await page.locator('[data-tutor-stage="0"]').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
 check(await page.locator('[data-tutor-stage="2"]').getAttribute('aria-selected')==='true','duas setas seguidas preservam foco nas abas');
 await page.locator('[data-tutor-stage="1"]').click();
 const eventCount=await page.evaluate(()=>THREAD.lessons[0].story.events.length);
 check(await page.locator('#storyEvents .story-event').count()===0,'mini-história não revela toda a análise antecipadamente');
 for(let i=0;i<eventCount;i++)await page.locator('#storyReveal').click();
 check(await page.locator('#storyEvents .story-event').count()===eventCount,'história se revela momento a momento');
 check(await page.locator('#storyQuestion').isVisible(),'pergunta da história aparece depois dos eventos');
 await page.locator('[data-tutor-stage="2"]').click();
 check(await page.locator('.tutor-comparison:visible>div').count()===2,'comparação funcional lado a lado');
 check(await page.locator('.exam-trap:visible').count()===1,'pegadinha identificada sem substituir análise');
 await page.locator('[data-tutor-stage="3"]').click();
 check(await page.locator('#tutorFeynmanFeedback').textContent()==='','resposta-modelo ocultada antes da produção');
 await page.locator('#tutorFeynmanAnswer').fill('Uma resposta é uma ação do organismo numa situação; é preciso descrever a relação com o ambiente.');await page.locator('#tutorFeynmanForm button').click();
 check((await page.locator('#tutorFeynmanFeedback').textContent()).includes('não interpretou seu texto'),'conferência não finge correção semântica');
 check(await page.locator('#tutorStepNext').isDisabled(),'escrever sem conferir critérios não libera a etapa');
 for(const c of await page.locator('[data-feynman-check]').all())await c.check();
 check(!await page.locator('#tutorStepNext').isDisabled(),'conferência explícita libera as questões');
 await page.locator('#tutorStepNext').click();
 check(await page.locator('[data-tutor-choice]').count()===3,'uma questão de três alternativas por vez');
 check(await page.locator('#tutorQuestionFeedback').textContent()==='','nenhum gabarito antes da tentativa');
 const first=await page.evaluate(()=>THREAD_QUESTIONS[THREAD.lessons[0].id][0]);
 await page.locator(`[data-tutor-choice="${(first.answer+1)%3}"]`).click();
 check(await page.locator('#tutorQuestionFeedback').getAttribute('class')==='feedback bad','erro produz explicação específica');
 check(await page.locator('#tutorQuestionNext').isHidden(),'erro não promove avanço imediato');
 check((await page.locator('#tutorRemediation').textContent()).includes(first.rebuild),'retomada explica o mesmo conceito de outro jeito');
 check(await page.locator('[data-tutor-followup]').count()===0,'verificação alternativa só aparece ao solicitá-la');
 await page.locator('#tutorTryOther').click();
 check(await page.locator('#tutorFollowupFeedback').textContent()==='','novo exemplo não entrega o gabarito');
 await page.locator(`[data-tutor-followup="${(first.followup.answer+1)%3}"]`).click();
 check(await page.locator('#tutorQuestionNext').isHidden(),'novo erro continua pedindo reconstrução');
 await page.locator('#tutorRetryFollowup').click();await page.locator(`[data-tutor-followup="${first.followup.answer}"]`).click();
 check(!await page.locator('#tutorQuestionNext').isHidden(),'acerto na nova situação permite seguir');
 await page.locator('#tutorQuestionNext').click();
 check((await page.locator('#tutorStage .pill').textContent()).includes('2 de 3'),'segunda pergunta entra após a primeira');
 for(let n=1;n<3;n++){
  const q=await page.evaluate(n=>THREAD_QUESTIONS[THREAD.lessons[0].id][n],n);await page.locator(`[data-tutor-choice="${q.answer}"]`).click();await page.locator('#tutorQuestionNext').click();
 }
 check(await page.locator('#tutorSummaryTitle').isVisible(),'final apresenta síntese após as três respostas');
 check(await page.locator('#tutorStage .essentials li').count()>=3&&await page.locator('#tutorStage .essentials li').count()<=5,'revisão final contém três a cinco ideias');
 check(!await page.locator('#tutorConceptNext').isDisabled(),'primeiro encontro concluído libera o próximo');
 check(!await page.locator('[data-tutor-concept="1"]').isDisabled(),'mapa acompanha desbloqueio sem recarga');
 const historyCount=await page.evaluate(()=>S.tutor.history.length);check(historyCount===5,'histórico registra erro inicial e verificações sem apagá-los');
 // Editing an explanation invalidates its self-check and relocks advancement.
 await page.locator('[data-tutor-stage="3"]').click();await page.locator('#tutorFeynmanAnswer').fill('Reescrevendo minha explicação, preciso conferir novamente os três critérios.');
 check(await page.locator('[data-tutor-concept="1"]').isDisabled(),'editar explicação atualiza pré-requisito no mapa');
 check(await page.locator('[data-tutor-stage="4"]').isDisabled(),'conferência anterior não vale automaticamente para texto novo');
 await page.locator('#tutorFeynmanForm button').click();for(const c of await page.locator('[data-feynman-check]').all())await c.check();
 await page.locator('[data-tutor-stage="4"]').click();await page.locator('#tutor .lesson-notes summary').click();await page.locator('#tutorNotes').fill('Meu fio de relações e minha dúvida de teste.');
 await page.reload();await page.locator('#startTutor').click();
 check(await page.locator('#tutorNotes').inputValue()==='Meu fio de relações e minha dúvida de teste.','notas do fio persistem');
 check(await page.evaluate(()=>tutorComplete('fio-01')),'progresso do novo percurso persiste');
 check(await page.evaluate(()=>valid(S)),'novo progresso passa validação de restauração');
 // Complete the remaining lessons through the public UI to exercise all gates and datasets.
 await page.locator('#tutorConceptNext').click();
 for(let index=1;index<18;index++){
  check((await page.locator('#tutorPosition').textContent()).includes(`Encontro ${index+1} de 18`),`encontro ${index+1} acessível após pré-requisito`);
  await page.locator('[data-tutor-stage="3"]').click();await page.locator('#tutorFeynmanAnswer').fill('Esta explicação de teste será conferida manualmente por critérios e depois por situações objetivas.');await page.locator('#tutorFeynmanForm button').click();
  for(const c of await page.locator('[data-feynman-check]').all())await c.check();await page.locator('#tutorStepNext').click();
  for(let n=0;n<3;n++){
   const q=await page.evaluate(({index,n})=>THREAD_QUESTIONS[THREAD.lessons[index].id][n],{index,n});await page.locator(`[data-tutor-choice="${q.answer}"]`).click();await page.locator('#tutorQuestionNext').click();
  }
  check(!await page.locator('#tutorConceptNext').isDisabled(),`três situações e explicação liberam encontro ${index+1}`);
  if(index<17)await page.locator('#tutorConceptNext').click();
 }
 check(await page.evaluate(()=>tutorCompletionCount())===18,'18 encontros conferidos sem remover materiais anteriores');
 // Formula lab works with observations before the label, preserving punishment context.
 await page.locator('[data-tutor-concept="6"]').click();await page.locator('[data-tutor-stage="1"]').click();
 await page.locator('#formulaName').click();check((await page.locator('#formulaFeedback').textContent()).includes('Ainda falta observar'),'sem dados não classifica reforçamento');
 await page.locator('#formulaChange').selectOption('remove');await page.locator('#formulaEffect').selectOption('up');await page.locator('#formulaName').click();
 check((await page.locator('#formulaFeedback').textContent()).includes('Reforçamento negativo'),'retirada com fortalecimento identificada por função');
 await page.locator('#formulaEffect').selectOption('down');await page.locator('#formulaName').click();
 check((await page.locator('#formulaFeedback').textContent()).includes('Skinner/Sidman'),'punição funcional contextualizada com definição dos slides');
 await page.locator('#formulaEffect').selectOption('same');await page.locator('#formulaName').click();
 check((await page.locator('#formulaFeedback').textContent()).includes('Não há evidência'),'ausência de efeito não recebe rótulo indevido');
 // Check every stage for actual content and responsive rendering.
 for(let i=0;i<18;i++){
  await page.evaluate(i=>openTutor(i),i);
  for(let step=0;step<5;step++)await page.evaluate(step=>setTutorStep(step),step);
 }
 check(errors.length===0,'todas as etapas dos 18 encontros sem exceções');
 await page.locator('#tutorBack').click();
 check((await page.locator('#tutorEntry').textContent()).includes(first.trap),'histórico de dificuldades aparece na jornada');
 await page.locator('.data-tools summary').click();const exp=page.waitForEvent('download');await page.locator('#export').click();const download=await exp;await download.saveAs('/tmp/clareia-tutor-progress.json');
 const data=JSON.parse(fs.readFileSync('/tmp/clareia-tutor-progress.json','utf8'));
 check(data.tutor.history.length>=historyCount&&data.notes['aba-1']==='Nota da versão anterior','exportação leva percurso novo e dados antigos');
 page.once('dialog',d=>d.accept());await page.locator('#restoreFile').setInputFiles('/tmp/clareia-tutor-progress.json');
 check(await page.evaluate(()=>tutorCompletionCount())===18,'restauração aceita novo percurso completo');
 await page.evaluate(()=>{$('#toast').hidden=true;S.preferences.focus=false;applyFocus();});
 await page.screenshot({path:'/workspace/montanaro/validation/tutor-home.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.locator('#startTutor').click();
 await page.locator('[data-tutor-concept="10"]').click();
 for(let step=0;step<5;step++){await page.locator(`[data-tutor-stage="${step}"]`).click();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`passo ${step+1} do fio responsivo no celular`);}
 await page.locator('[data-tutor-stage="0"]').click();await page.screenshot({path:'/workspace/montanaro/validation/tutor-mobile.png',fullPage:true});
 await page.locator('[data-tutor-stage="3"]').click();await page.locator('#tutorFeynmanForm button').click();
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'feedback Feynman responsivo com critérios longos');
 // Offline export must preserve the new data and engine.
 const out=page.waitForEvent('download');await page.locator('#downloadApp').evaluate(b=>b.click());const html=await out;await html.saveAs('/tmp/clareia-tutor.html');
 const offlineContext=await browser.newContext({offline:true,reducedMotion:'reduce'}),offline=await offlineContext.newPage();const offlineErrors=[];offline.on('pageerror',e=>offlineErrors.push(e.message));
 await offline.setContent(fs.readFileSync('/tmp/clareia-tutor.html','utf8'));await offline.locator('#startTutor').click();
 check(await offline.locator('#tutor').isVisible()&&await offline.evaluate(()=>THREAD.lessons.length)===18,'novo percurso executa no HTML offline');
 check(offlineErrors.length===0,'HTML exportado não produz erros');
 check(errors.length===0,'sem exceções JavaScript na aula particular');check(external.length===0,'sem requisições a serviços externos');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
