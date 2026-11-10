// per texture size: decoder numbers + "monocular leak" (vertical tearing inside the letter rows
// vs outside them; 1.0 = the shape is invisible to one eye)
const res = {};
for (const rmax of window.EVAL_RMAX || [16, 8, 5]) {
  window.MAGIC_RMAX = rmax; const runs = [];
  for (let t = 0; t < (window.EVAL_N || 4); t++) {
    const r = gerar(window.EVAL_FRASE || 'te amo'); const ok = conferir(r); const a = mostrarAnalise(r);
    const d = r.cv.getContext('2d').getImageData(0, 0, r.W, r.H).data, L = i => d[4*i]*.299 + d[4*i+1]*.587 + d[4*i+2]*.114;
    const rows = [...Array(r.H).keys()].map(y => { let s = 0; for (let x = r.P; x < r.W; x++) if (r.dep[y*r.W+x]) { s = 1; break; } return s; });
    let e1 = 0, n1 = 0, e0 = 0, n0 = 0;
    for (let y = 1; y < r.H; y++) { let e = 0; for (let x = r.P; x < r.W; x++) e += Math.abs(L(y*r.W+x) - L((y-1)*r.W+x)); if (rows[y] && rows[y-1]) { e1 += e; n1++; } else if (!rows[y] && !rows[y-1]) { e0 += e; n0++; } }
    runs.push({ ok, ...a, leak: (e1 / n1) / (e0 / n0) });
  }
  const m = k => +(runs.reduce((s, r) => s + r[k], 0) / runs.length).toFixed(2);
  res['rmax ' + rmax] = { conferidos: runs.filter(r => r.ok).length + '/' + runs.length, ruido: m('fundo_manchado'), letras: m('letras_achadas'), iou: m('iou'), vazamento: m('leak') };
}
delete window.MAGIC_RMAX; return res;
