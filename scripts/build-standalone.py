from pathlib import Path
import base64
root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
css = (root / 'style.css').read_text()
for name in ['barlow-condensed-latin-800-normal.woff2', 'dm-sans-latin-400-normal.woff2']:
    data = base64.b64encode((root / 'assets' / name).read_bytes()).decode()
    css = css.replace('assets/' + name, 'data:font/woff2;base64,' + data)
js = (root / 'app.js').read_text().replace('export function progress', 'function progress')
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
html = html.replace('<script type="module" src="app.js"></script>', '<script>' + js + '</script>')
(root / 'Haunted-Meter-Standalone.html').write_text(html)
print('Built Haunted-Meter-Standalone.html with embedded code and fonts')
