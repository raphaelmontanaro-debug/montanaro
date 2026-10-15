"""Build the offline, standalone educational app. Python standard library only."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
data = json.loads((SRC / 'course-data.json').read_text())
# Protect JSON embedded in an HTML script element.
payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
html = '''<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#17594b"><meta name="description" content="Uma jornada interativa de Análise do Comportamento, com 37 aulas, laboratório, questões e sete PDFs completos."><title>Clareia • Análise do Comportamento</title><style>'''
html += (SRC / 'styles.css').read_text() + '</style></head><body>'
html += (SRC / 'shell.html').read_text()
html += '<script type="application/json" id="courseData">' + payload + '</script>'
html += '<script>' + (SRC / 'app.js').read_text() + '</script></body></html>'
(ROOT / 'index.html').write_text(html)
(ROOT / 'Clareia-ABA.html').write_text(html)
print(f'index.html: {len(html.encode()) / 1024 / 1024:.2f} MB; '
      f'{len(data)} módulos; {sum(len(m["lessons"]) for m in data)} aulas; '
      f'{sum(len(m["quiz"]) for m in data)} questões.')
