// ---- Geração: forma (coração) em relevo + palavras da frase um nível acima ------------------
// O coração é um planalto a P-1 (um nível à frente) feito de enfeites; cada palavra da frase
// fica dentro dele a P-2 (dois níveis). Usa relevoLinha() (acima), que transforma qualquer
// perfil de profundidade por linha em palavras de verdade.
function dentroCoracao(y, x, cx, cy, R) {          // célula ~2x mais alta que larga
  const u = Math.abs(x + 0.5 - cx) / (R * 2), v = -(y + 0.5 - cy) / R;   // dois lobos + ponta
  return (u - 0.5) ** 2 + (v - 0.45) ** 2 <= 0.55 ** 2 || (v <= 0.45 && v >= -1.05 && u <= (v + 1.05) * 0.7);
}
function gerar(frase) {
  const palavras = frase.split(/\s+/).map(w => w.replace(/[^\p{L}\p{N}'-]/gu, '')).filter(Boolean);
  if (!palavras.length) return { erro: 'Digite pelo menos uma palavra.' };
  const maior = Math.max(...palavras.map(w => w.length));
  const P = Math.max(28, maior + 21);
  const H = Math.max(15, palavras.length + 9);       // linhas da parede
  const R = (H - 3) / 2.05, cy = 1 + R;     // topo dos lobos na linha 1, ponta em H-2
  const larg = Math.ceil(R * 2.05 * 1.15 * 2);       // largura do coração em caracteres
  const L = Math.max(Math.round(P * 1.2) + larg + 12, Math.round(P * 3.4));
  const cx = Math.round(L / 2);
  const proibidas = new Set(palavras.flatMap(w => [w, w.toLowerCase(), w.toLowerCase() + 's', w.toLowerCase().replace(/s$/, '')]));
  const livre = p => !proibidas.has(p.longa) && !proibidas.has(p.curta);
  const bancos = { antes: ANTES.filter(livre), depois: DEPOIS.filter(livre), enfeites: ENFEITES.filter(w => !proibidas.has(w)), curtas: CURTAS.filter(w => !proibidas.has(w)), proibidas: [...proibidas] };
  // linhas do coração largas o bastante pra uma palavra (com folga de 4 de cada lado)
  // trechos [ini, fim) do coração em cada linha (a linha dos lobos tem dois)
  const trechos = y => { const t = []; for (let x = 0; x < L; x++) if (dentroCoracao(y, x, cx, cy, R)) { if (t.length && t.at(-1)[1] === x) t.at(-1)[1]++; else t.push([x, x + 1]); } return t; };
  const faixa = y => { const t = trechos(y); return t.length === 1 ? t[0] : null; };
  const cabem = [...Array(H).keys()].filter(y => { const f = faixa(y); return f && f[1] - f[0] >= maior + 13; });
  if (cabem.length < palavras.length) return { erro: `Frase longa demais pro coração (${cabem.length} linhas cabem).` };
  // espalha as palavras pelas linhas que cabem
  const linhaDa = palavras.map((_, i) => cabem[Math.round((i + 0.5) * cabem.length / palavras.length - 0.5)]);
  const linhas = [];
  for (let y = 0; y < H; y++) {
    const f = faixa(y), i = linhaDa.indexOf(y), w = i >= 0 ? palavras[i] : null;
    let r = null;
    for (let t = 0; t < 120 && (!r || r.erro); t++) {
      const j = t ? () => Math.floor(Math.random() * 3) - 1 : () => 0;   // empurra bordas ±1 se não couber
      const sep = new Array(L).fill(P), fixas = [];
      for (const [i0, i1] of trechos(y)) for (let x = i0 + j(); x < i1 + j(); x++) sep[x] = P - 1;
      let x0 = null;
      if (w) {
        x0 = Math.round((f[0] + f[1]) / 2 - w.length / 2) + (t ? Math.floor(Math.random() * 7) - 3 : 0);
        for (let x = x0 - 1; x < x0 + w.length + 1; x++) sep[x] = P - 2;
        fixas.push({ x: x0, w });
      }
      r = relevoLinha(sep, P, bancos, fixas);
      if (!r.erro) r.palavra = w ? { x0, w } : null;
    }
    if (r.erro) return { erro: `Não consegui montar a linha ${y + 1} (${r.erro}).` };
    linhas.push({ texto: r.texto, sep: r.sep, palavra: r.palavra, marca: null });
  }
  return { linhas, P, palavras, forma: true };
}
const VOCAB = new Set([...ENFEITES, ...CURTAS, ...ANTES.flatMap(a => [a.longa, a.curta]), ...DEPOIS.flatMap(a => [a.longa, a.curta])]);
function conferir({ linhas, P, palavras }) {
  let ruins = 0, estranhas = [];
  for (const l of linhas) {
    ruins += conferirRelevo(l.texto, l.sep, P);
    estranhas.push(...palavrasValidas(l.texto, VOCAB).filter(w => !palavras.includes(w)));
  }
  return ruins === 0 && estranhas.length === 0;
}

