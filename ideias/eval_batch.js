// Body of an async function, run with: cdp-eval --port 9333 --match <page> --file eval_batch.js
// Generates N walls with the page's own gerar(), checks conferir(), runs mostrarAnalise() (the page's
// pixel decoder) and parses #leitura. Returns per-trial noise and whether each hidden word was found
// on its own line. window.EVAL_FRASE / EVAL_N / EVAL_EXPORT can be set beforehand.
const frase = window.EVAL_FRASE || 'o gato subiu no telhado';
const N = window.EVAL_N || 8;
const out = [];
for (let t = 0; t < N; t++) {
  const r = gerar(frase);
  if (r.erro) { out.push({ erro: r.erro }); continue; }
  const ok = conferir(r);
  mostrarAnalise(r);
  const txt = document.getElementById('leitura').textContent;
  const noise = parseFloat(txt.match(/manchado: ([\d.]+)%/)[1]);
  const found = [...txt.matchAll(/linha (\d+) (\S[^,]*?)(?=, linha|\. \()/g)].map(m => ({ linha: +m[1], trecho: m[2] }));
  // expected: line index (1-based) of each hidden word
  const esperado = r.linhas.map((l, i) => l.marca ? { linha: i + 1, w: l.texto.slice(...l.marca) } : null).filter(Boolean);
  let hits = 0, partial = 0;
  for (const e of esperado) {
    const f = found.find(f => f.linha === e.linha);
    if (!f) continue;
    if (f.trecho.split(/\s+/).includes(e.w)) hits++; else if (e.w.includes(f.trecho.split(/\s+/)[0]) || f.trecho.includes(e.w.slice(0, 2))) partial++;
  }
  const falsos = found.filter(f => !esperado.some(e => e.linha === f.linha)).length;
  out.push({ ok, noise, palavras: esperado.length, inteiras: hits, parciais: partial, falsos, P: r.P });
}
const ns = out.map(o => o.noise).filter(x => x != null).sort((a, b) => a - b);
return {
  frase, N,
  conferidos: out.filter(o => o.ok).length,
  ruido_mediana: ns[Math.floor(ns.length / 2)], ruido_min: ns[0], ruido_max: ns[ns.length - 1],
  palavras_inteiras: out.reduce((s, o) => s + (o.inteiras || 0), 0) + '/' + out.reduce((s, o) => s + (o.palavras || 0), 0),
  parciais: out.reduce((s, o) => s + (o.parciais || 0), 0),
  linhas_falsas: out.reduce((s, o) => s + (o.falsos || 0), 0),
};
