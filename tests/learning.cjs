const {chromium}=require('playwright');
const fs=require('fs');
const base=process.env.CLAREIA_URL||'http://127.0.0.1:8000';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const ctx=await browser.newContext({viewport:{width:1440,height:1024},reducedMotion:'reduce',acceptDownloads:true});
 const page=await ctx.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base)&&/^https?:/.test(r.url()))external.push(r.url());});
 const check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS',msg);};
 // Preserve progress made with the first released version.
 await page.addInitScript(()=>{if(!localStorage.getItem('test-seeded')){
  localStorage.setItem('clareia-aba-v2',JSON.stringify({done:['aba-1'],notes:{'aba-1':'Anotação da versão anterior'},answers:{'aba-q0':{ok:true,choice:1}},last:{module:'aba',lesson:0}}));
  localStorage.setItem('test-seeded','1');
 }});
 await page.goto(base);
 check(await page.locator('#doneCount').textContent()==='1/37','progresso anterior preservado');
 check(await page.locator('#modules .module').count()===7,'estrutura original com sete módulos');
 check(await page.evaluate(()=>PRACTICE.length)===111,'111 desafios guiados disponíveis');
 await page.locator('#continue').click();
 check(await page.locator('#centralQuestion').isVisible(),'microlição começa por pergunta central');
 check(!await page.locator('#lessonIdea').isVisible(),'aprofundamento não sobrecarrega a primeira etapa');
 check(await page.locator('#microSteps [role=tab]').count()===6,'seis etapas funcionais');
 check(await page.locator('#notes').inputValue()==='Anotação da versão anterior','anotações antigas preservadas');
 await page.locator('#focusToggle').click();await page.reload();check(await page.locator('body').getAttribute('class')==='focus-mode','modo foco persiste');
 await page.locator('#continue').click();
 for(let i=0;i<6;i++){
  await page.locator(`[data-micro="${i}"]`).click();
  check(await page.locator('.micro-stage:visible').count()===1,`uma etapa visível por vez (${i+1}/6)`);
 }
 await page.locator('[data-micro="0"]').focus();await page.keyboard.press('ArrowRight');
 check(await page.locator('[data-micro="1"]').getAttribute('aria-selected')==='true','teclado navega as etapas');
 await page.locator('[data-micro="3"]').click();check(await page.locator('.misconception').count()===3,'três confusões por módulo');
 await page.locator('.misconception summary').first().click();check(await page.locator('.misconception[open]').count()===1,'equívoco se abre com explicação completa');
 await page.locator('[data-micro="4"]').click();check(await page.locator('#recallFeedback').textContent()==='','modelo de recuperação oculto antes da resposta');
 await page.locator('#recallAnswer').fill('Uma intervenção precisa relacionar dados do comportamento e condições ambientais.');
 await page.locator('#recallForm button').click();check((await page.locator('#recallFeedback').textContent()).includes('Conferência guiada'),'recuperação revela comentário sem inventar nota');
 await page.locator('#recallSelfCheck').check();
 await page.locator('[data-micro="5"]').click();check(await page.locator('#essentialIdeas li').count()<=5,'síntese com no máximo cinco ideias');
 await page.locator('#reviewTomorrow').click();check((await page.locator('#lessonReviewPlan').textContent()).includes('Próxima revisão sugerida'),'revisão futura registrada');
 const oldDue=await page.evaluate(()=>S.reviews['aba-1'].due);await page.reload();check(await page.evaluate(()=>S.reviews['aba-1'].due)===oldDue,'agenda preservada após recarregar');
 // Simulate passage of time, then rate recall and verify the due queue updates.
 await page.evaluate(()=>{S.reviews['aba-1'].due=Date.now()-1000;persist();});
 await page.locator('nav [data-view="cards"]').click();await page.locator('#dueCards').click();
 check((await page.locator('#cardCounter').textContent()).includes('de 1'),'fila mostra somente revisão vencida');
 check(await page.locator('[data-interval]').count()===0,'autoavaliação aparece só depois de tentar recuperar');
 await page.locator('#flash').click();await page.locator('[data-interval="3"]').click();
 check(await page.evaluate(()=>S.reviews['aba-1'].interval)===3,'intervalo ajustado pela autoavaliação');
 check(await page.locator('#flash').isDisabled(),'fila vazia tratada sem erro');
 // Guided practice must hide rationale before a response and offer remediation on error.
 await page.locator('nav [data-view="quiz"]').click();await page.locator('#quizFilter').selectOption('aba');
 await page.locator('#practiceLessonFilter').selectOption('aba-1');
 const first=await page.evaluate(()=>guidedBatch[0]);
 check(await page.locator('#guidedFeedback').textContent()==='','gabarito não revelado antes da tentativa');
 await page.locator(`[data-guided-choice="${(first.answer+1)%3}"]`).click();
 check(await page.locator('#guidedFeedback').getAttribute('class')==='feedback bad','erro produz feedback específico');
 check(await page.locator('#guidedContinue').isDisabled(),'dificuldade leva à consolidação antes de avançar');
 check(await page.locator('#followUpForm').isVisible(),'nova pergunta após dificuldade');
 await page.locator('#followUpAnswer').fill('Uma análise adequada investiga a mudança e a relação descrita no exemplo.');
 await page.locator('#followUpForm button').click();check(await page.locator('#guidedContinue').isDisabled(),'conferência pede participação explícita');
 await page.locator('#followUpReady').check();await page.locator('#guidedContinue').click();
 check(await page.evaluate(()=>document.activeElement===document.querySelector('#quizArea h2')),'foco acompanha o novo enunciado');
 check(await page.locator('#shortAnswerForm').isVisible(),'nível de conexões solicita produção de explicação');
 check(await page.locator('#guidedFeedback').textContent()==='','rubrica e resposta abertas apenas após escrever');
 await page.locator('#shortAnswer').fill('A consequência deve ser estudada no contexto. O efeito é investigado com medidas e não por uma impressão isolada.');
 await page.locator('#shortAnswerForm button').click();
 check(await page.locator('[data-rubric]').count()===3,'critérios explícitos para a resposta curta');
 check((await page.locator('#guidedFeedback').textContent()).includes('não inferiu o sentido'),'avaliação aberta identificada como guiada');
 for(const box of await page.locator('[data-rubric]').all())await box.check();
 await page.locator('#recordSelfCheck').click();await page.locator('#guidedContinue').click();
 check((await page.locator('#quizCounter').textContent()).includes('nível 3'),'progressão até aplicação avançada');
 const third=await page.evaluate(()=>guidedBatch[2]);await page.locator(`[data-guided-choice="${third.answer}"]`).click();await page.locator('#guidedContinue').click();
 check(await page.locator('#nextGuidedBlock').isVisible(),'bloco termina com síntese e intercalamento');
 await page.locator('#nextGuidedBlock').click();check(await page.locator('#quizFilter').inputValue()==='all','intercalamento permite outro tema');
 check(await page.evaluate(()=>guidedBatch[0].moduleId)!=='aba','prática intercalada muda o módulo');
 await page.locator('nav [data-view="home"]').click();
 check((await page.locator('#learningDashboard').textContent()).includes(first.misconception),'dificuldade conceitual registrada na jornada');
 // Export and restore the richer state, then restore a legacy export.
 await page.locator('.data-tools summary').click();const dlPromise=page.waitForEvent('download');await page.locator('#export').click();const dl=await dlPromise;await dl.saveAs('/tmp/clareia-new-progress.json');
 const exported=JSON.parse(fs.readFileSync('/tmp/clareia-new-progress.json','utf8'));
 check(exported.practice[first.id].ok===false&&exported.reviews['aba-1'].interval===1,'exportação leva tentativas e revisões');
 page.once('dialog',d=>d.accept());await page.locator('#restoreFile').setInputFiles('/tmp/clareia-new-progress.json');
 check(await page.evaluate(()=>S.practice[guidedBatch[0].id]!==undefined||Object.keys(S.practice).length>=3),'restauração aceita o novo formato');
 fs.writeFileSync('/tmp/clareia-legacy.json',JSON.stringify({done:['bia-1'],notes:{'bia-1':'Notas antigas'},answers:{},last:null}));
 page.once('dialog',d=>d.accept());await page.locator('#restoreFile').setInputFiles('/tmp/clareia-legacy.json');
 check(await page.evaluate(()=>S.done[0]==='bia-1'&&S.reviews&&S.practice),'exportação antiga continua restaurável');
 // Every enriched lesson and every activity must render without missing fields.
 const ids=await page.evaluate(()=>allLessons.map(l=>({id:l.id,module:l.module.id,index:l.module.lessons.findIndex(x=>x.id===l.id)})));
 for(const l of ids){await page.evaluate(l=>{openLesson(l.module,l.index);for(let i=0;i<6;i++)setMicroStep(i);},l);}
 check(errors.length===0,'37 microlições e suas seis etapas sem exceções');
 await page.evaluate(()=>{for(const m of D)for(const l of m.lessons){launchGuided(m.id,l.id);for(let i=0;i<3;i++){guidedIndex=i;renderGuided();}}});
 check(errors.length===0,'111 atividades renderizam com suas referências');
 await page.locator('nav [data-view="home"]').click();await page.evaluate(()=>{S.preferences.focus=false;applyFocus();$('#toast').hidden=true;});
 await page.screenshot({path:'/workspace/montanaro/validation/desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'jornada mobile sem overflow');
 await page.screenshot({path:'/workspace/montanaro/validation/mobile.png',fullPage:true});
 await page.locator('[data-module="funcional"]').click();
 for(let i=0;i<6;i++){await page.locator(`[data-micro="${i}"]`).click();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`etapa ${i+1} responsiva em 390 px`);}
 await page.locator('[data-micro="4"]').click();
 await page.locator('#recallAnswer').fill('Um episódio conecta condições anteriores, resposta e consequências observadas.');await page.locator('#recallForm button').click();
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'feedback de recuperação responsivo no celular');
 await page.locator('[data-micro="0"]').click();await page.evaluate(()=>$('#toast').hidden=true);await page.screenshot({path:'/workspace/montanaro/validation/mobile-lesson.png',fullPage:true});
 await page.locator('#practiceModule').click();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'prática mobile sem overflow');
 const mobileQ=await page.evaluate(()=>guidedBatch[guidedIndex]);await page.locator(`[data-guided-choice="${(mobileQ.answer+1)%3}"]`).click();
 await page.locator('#followUpAnswer').fill('A distinção precisa levar em conta o contexto e a relação descrita no exemplo.');await page.locator('#followUpForm button').click();
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'feedback de consolidação responsivo no celular');
 // Exported HTML must initialize and run without a network connection.
 const appDownload=page.waitForEvent('download');await page.locator('#downloadApp').evaluate(b=>b.click());const htmlDownload=await appDownload;await htmlDownload.saveAs('/tmp/clareia-updated.html');
 const offlineContext=await browser.newContext({offline:true,reducedMotion:'reduce'}),offline=await offlineContext.newPage();const offlineErrors=[];offline.on('pageerror',e=>offlineErrors.push(e.message));
 await offline.setContent(fs.readFileSync('/tmp/clareia-updated.html','utf8'));
 check(await offline.locator('#home').isVisible(),'HTML exportado inicia offline');
 await offline.locator('nav [data-view="quiz"]').click();check(await offline.locator('[data-guided-choice]').count()===3,'atividades guiadas executam offline');
 check(offlineErrors.length===0,'sem erros no HTML exportado offline');
 check(external.length===0,'nenhuma requisição para serviços externos');
 check(errors.length===0,'sem erros JavaScript nos fluxos da nova versão');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
