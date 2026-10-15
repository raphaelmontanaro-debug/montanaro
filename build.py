"""Build the offline, standalone educational app. Python standard library only."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
data = json.loads((SRC / 'course-data.json').read_text())
learning = json.loads((SRC / 'learning-data.json').read_text())
assessment = json.loads((SRC / 'assessment-data.json').read_text())
lesson_ids = {l['id'] for m in data for l in m['lessons']}
assert set(learning['lessons']) == lesson_ids, 'Every original lesson needs progressive learning content.'
assert set(learning['modules']) == {m['id'] for m in data}, 'Every module needs prerequisites and misconceptions.'
for m in data:
    assert len(learning['modules'][m['id']]['misconceptions']) == 3
    for lesson in m['lessons']:
        enrichment = learning['lessons'][lesson['id']]
        for field in ['question', 'simple', 'prior', 'analogy', 'analogyLimit', 'counterexample', 'recall', 'recallModel', 'nextConnection']:
            assert isinstance(enrichment[field], str) and enrichment[field].strip(), (lesson['id'], field)
        assert 1 <= len(enrichment['essentials']) <= 5
        questions = [q for q in assessment if q['lessonId'] == lesson['id']]
        assert len(questions) == 3 and {q['level'] for q in questions} == {1, 2, 3}
        assert sum(q['type'] == 'short' for q in questions) == 1
        for q in questions:
            assert q['moduleId'] == m['id']
            assert 1 <= q['pages'][0] <= q['pages'][1] <= m['pageCount']
            assert q['clues'] and q['reasoning'] and q['followUp']['prompt'] and q['followUp']['answer']
            if q['type'] == 'choice':
                assert len(q['options']) == 3 and len(q['rationales']) == 3 and 0 <= q['answer'] < 3
            else:
                assert q['type'] == 'short' and len(q['rubric']) == 3 and q['modelAnswer']
assert len(assessment) == len(lesson_ids) * 3
assert len({q['id'] for q in assessment}) == len(assessment)
tutor = json.loads((SRC / 'tutor-data.json').read_text())
tutor_questions = json.loads((SRC / 'tutor-questions.json').read_text())
tutor_ids = {l['id'] for l in tutor['lessons']}
assert len(tutor_ids) == len(tutor['lessons']) == 18
assert set(tutor_questions) == tutor_ids
assert len({q['id'] for items in tutor_questions.values() for q in items}) == 54
for lesson in tutor['lessons']:
    for field in ['title','question','whyNow','simple','technical','everyday','educational','counterexample','trap','memory','analogy','analogyLimit','next']:
        assert isinstance(lesson[field], str) and lesson[field].strip(), (lesson['id'], field)
    assert 3 <= len(lesson['essentials']) <= 5
    assert len(lesson['feynman']['rubric']) == 3 and lesson['feynman']['model']
    assert lesson['story']['events'] and lesson['mechanism'] and isinstance(lesson['supplement'], bool)
    for ref in lesson['refs']:
        module = next(m for m in data if m['id'] == ref['moduleId'])
        assert 1 <= ref['pages'][0] <= ref['pages'][1] <= module['pageCount']
    assert len(tutor_questions[lesson['id']]) == 3
    for q in tutor_questions[lesson['id']]:
        for item in [q, q['followup']]:
            assert len(item['options']) == len(item['rationales']) == 3
            assert 0 <= item['answer'] < 3 and item['prompt']
        assert q['clues'] and q['reasoning'] and q['trap'] and q['rebuild']
# Protect JSON embedded in an HTML script element.
payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
html = '''<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#17594b"><meta name="description" content="Uma jornada interativa de Análise do Comportamento, com 37 aulas, laboratório, questões e sete PDFs completos."><title>Clareia • Análise do Comportamento</title><style>'''
html += (SRC / 'styles.css').read_text() + '</style></head><body>'
html += (SRC / 'shell.html').read_text()
html += '<script type="application/json" id="courseData">' + payload + '</script>'
for source, element in [('learning-data.json', 'learningData'), ('assessment-data.json', 'assessmentData'), ('tutor-data.json', 'tutorData'), ('tutor-questions.json', 'tutorQuestions')]:
    content = json.loads((SRC / source).read_text())
    safe = json.dumps(content, ensure_ascii=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    html += f'<script type="application/json" id="{element}">' + safe + '</script>'
for script in ['app.js', 'learning.js', 'tutor.js']:
    html += '<script>' + (SRC / script).read_text() + '</script>'
html += '</body></html>'
(ROOT / 'index.html').write_text(html)
(ROOT / 'Clareia-ABA.html').write_text(html)
print(f'index.html: {len(html.encode()) / 1024 / 1024:.2f} MB; '
      f'{len(data)} módulos; {sum(len(m["lessons"]) for m in data)} aulas; '
      f'{len(assessment)} desafios guiados + {sum(len(m["quiz"]) for m in data)} questões anteriores; '
      f'{len(tutor["lessons"])} encontros do zero e 54 questões + 54 verificações.')
