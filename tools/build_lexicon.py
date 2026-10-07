#!/usr/bin/env python3
"""Genera src/assets/lexicon.js a partir del PDF del Diccionario Básico de la LSC.
Uso: python3 tools/build_lexicon.py ruta/Diccionario-lengua-de-senas.pdf [salida.js]
Requiere `pdftotext` (poppler-utils)."""
import json, re, subprocess, sys, unicodedata

pdf = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else 'src/assets/lexicon.js'
text = subprocess.run(['pdftotext', pdf, '-'], capture_output=True, text=True, check=True).stdout

body = text[:text.find('ANEXO 1.')] if 'ANEXO 1.' in text else text
body = body.replace('\f', '\n\n')
body = re.sub(r'DICCIONARIO BÁSICO DE LA LENGUA DE SEÑAS COLOMBIANA\n', '', body)
blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]

CAT = re.compile(r'^(n|v|adj|adv|conj|loc|prep|pron)\.\s')
CAPS = r"[A-ZÁÉÍÓÚÑÜ0-9 \-/\(\)\.,'¿?x]+"
HAND = r'(mano|dedo|palma|índice|pulgar|brazo|puño)'
entries = []
for b in blocks:
    ls = b.split('\n')
    if len(ls) < 3:
        continue
    h = ls[0].strip()
    if not re.fullmatch(r"[A-ZÁÉÍÓÚÑÜ0-9 \-/\(\)\.,'¿?]+", h) or len(h) > 40 or not re.search('[A-ZÁÉÍÓÚÑ]{2}', h):
        continue
    if not CAT.match(ls[1]):
        continue
    cat = CAT.match(ls[1]).group(1)
    rest = ls[1:]
    i = 1
    while i < len(rest) and not re.fullmatch(CAPS, rest[i].strip()):
        i += 1
    definition = CAT.sub('', ' '.join(rest[:i]), 1).strip()
    glosa = desc = ''
    if i < len(rest):
        j = i
        while j < len(rest) and re.fullmatch(CAPS, rest[j].strip()):
            j += 1
        glosa = ' '.join(rest[i:j])
        k = j
        while k < len(rest) and not re.match(r'^(\(|La |Las |El |Los |Ambas|Ambos|Una |Un |Con |Se |Dos |Tres |Cuatro |Cinco )', rest[k]):
            k += 1
        desc = re.sub(r'\s+', ' ', ' '.join(rest[k:]))[:420]
    entries.append({'w': h, 'c': cat, 'd': definition[:160], 'g': glosa, 's': desc})

def norm_key(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', s.replace('-', ' '))).strip()

lex = {}
for e in entries:
    s = e['s']
    m = re.match(r'^(.*?[.?!])\s+((?:\(|La |Las |Ambas|Ambos|Los |El |Dos |Con ).*)$', s)
    if m and not re.search(HAND, m.group(1), re.I):
        s = m.group(2)  # descarta la traducción al español que antecede a la descripción
    d = e['d']
    if len(d) >= 160:
        d = d[:d.rfind(' ')] + '…'
    value = [e['w'], e['c'], d, e['g'], s]
    for part in e['w'].split('/'):
        key = norm_key(part)
        if key and key not in lex:
            lex[key] = value

data = json.dumps(lex, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
open(out, 'w', encoding='utf-8').write('window.LEX=' + data + ';\n')
print(f'{len(entries)} entradas, {len(lex)} claves -> {out}')
