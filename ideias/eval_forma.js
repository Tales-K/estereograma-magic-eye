const frases = window.EVAL_FRASES || ['o gato subiu no telhado', 'te amo', 'feliz aniversário', 'a vida é bela demais'];
const N = window.EVAL_N || 6, out = {};
for (const f of frases) {
  const rs = [];
  for (let t = 0; t < N; t++) {
    const r = gerar(f); if (r.erro) { rs.push({ erro: r.erro }); continue; }
    const ok = conferir(r); const a = mostrarAnalise(r);
    rs.push({ ok, ...a });
  }
  const g = rs.filter(r => !r.erro), med = k => { const v = g.map(r => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  out[f] = { geradas: g.length + '/' + N, erros: rs.filter(r => r.erro).map(r => r.erro).slice(0, 2), conferidas: g.filter(r => r.ok).length,
    P: g[0] && g[0].Pchars, ruido_med: med('fundo_manchado'), ruido_max: Math.max(...g.map(r => r.fundo_manchado)),
    coracao_med: med('coracao_achado'), coracao_min: Math.min(...g.map(r => r.coracao_achado)),
    palavras_med: med('palavras_achadas'), palavras_min: Math.min(...g.map(r => r.palavras_achadas)) };
}
return out;
