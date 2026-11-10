// Análise da forma: mesmo decodificador e mesmo filtro de moda da página; compara, casa a casa,
// o nível decodificado com o nível pedido (0 fundo, 1 coração, 2 palavra).
function mostrarAnalise(r) {
  const t0 = performance.now();
  const img = desenhar(r.linhas, 14, colunasGuia(r));
  const { P, prof, W, H } = analisar(img.cv);
  const cv = $('mapa'), ctx = cv.getContext('2d');
  cv.width = W; cv.height = H;
  const out = ctx.createImageData(W, H), cor = (i, c) => { out.data.set([...c, 255], 4 * i); };
  const cw = img.cw;
  const bruto = new Int8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const p = prof[i];
    if (Number.isNaN(p)) { bruto[i] = -1; continue; }
    const n = Math.round(p / cw);
    bruto[i] = n < 0 ? 0 : n === 0 ? 1 : n === 1 ? 2 : 3;
  }
  const RX = 6, RY = 5, W1 = W + 1, conta = [0, 1, 2, 3].map(() => new Int32Array(W1 * (H + 1)));
  for (let k = 0; k < 4; k++) {
    const S = conta[k];
    for (let y = 0; y < H; y++) { let linha = 0; for (let x = 0; x < W; x++) { linha += bruto[y * W + x] === k; S[(y + 1) * W1 + x + 1] = S[y * W1 + x + 1] + linha; } }
  }
  const niveis = new Int8Array(W * H);
  const COR = [[229, 72, 77], [43, 74, 155], [255, 213, 74], [255, 138, 61]];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const x0 = Math.max(0, x - RX), x1 = Math.min(W, x + RX + 1), y0 = Math.max(0, y - RY), y1 = Math.min(H, y + RY + 1);
    let best = 1, bv = -1;
    for (let k = 0; k < 4; k++) {
      const S = conta[k], v = S[y1 * W1 + x1] - S[y0 * W1 + x1] - S[y1 * W1 + x0] + S[y0 * W1 + x0];
      if (v > bv) { bv = v; best = k; }
    }
    if (bv <= 0) { cor(i, [58, 58, 64]); niveis[i] = 9; continue; }
    niveis[i] = best - 1;
    cor(i, COR[best]);
  }
  ctx.putImageData(out, 0, 0);
  ctx.font = img.font; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(255,255,255,.42)';
  r.linhas.forEach((l, y) => [...l.texto].forEach((ch, x) => ctx.fillText(ch, img.pad + x * cw, img.linhaY(y))));
  // casa a casa: nível decodificado (moda dos pixels) × nível pedido
  const dmaxCol = Math.ceil(P * 1.1 / cw) + 1;
  const m = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];          // m[pedido][decodificado], decodificado 2 = "2+"
  r.linhas.forEach((l, y) => {
    const y0 = img.linhaY(y), y1 = y0 + Math.round(img.lh * 0.7);
    for (let c = dmaxCol; c < l.texto.length; c++) {
      const v = [0, 0, 0, 0];
      for (let yy = y0; yy < y1; yy++) for (let x = Math.round(img.pad + c * cw); x < Math.round(img.pad + (c + 1) * cw); x++) {
        const n = niveis[yy * W + x]; if (n !== 9) v[n + 1]++;
      }
      if (v[0] + v[1] + v[2] + v[3] === 0) continue;
      const dec = Math.max(0, v.indexOf(Math.max(...v)) - 1);   // -1 (atrás) conta como fundo errado → 0? não: atrás = erro
      const ped = r.P - l.sep[c];
      const decN = v.indexOf(Math.max(...v)) === 0 ? -1 : dec;
      if (decN < 0) { m[ped][0] += 0; m[ped].atras = (m[ped].atras || 0) + 1; continue; }
      m[ped][Math.min(2, decN)]++;
    }
  });
  const tot = k => m[k][0] + m[k][1] + m[k][2] + (m[k].atras || 0);
  const pct = (a, b) => (100 * a / (b || 1)).toFixed(1);
  const res = {
    P, Pchars: +(P / cw).toFixed(1),
    fundo_manchado: +pct(tot(0) - m[0][0], tot(0)),
    coracao_achado: +pct(m[1][1], tot(1)), coracao_mais_alto: +pct(m[1][2], tot(1)),
    palavras_achadas: +pct(m[2][2], tot(2)), palavras_so_1nivel: +pct(m[2][1], tot(2)),
    casas: [tot(0), tot(1), tot(2)], ms: Math.round(performance.now() - t0),
  };
  $('leitura').innerHTML = `Repetição do fundo: <b>${P} px</b> (${res.Pchars} caracteres). Fundo manchado: <b>${res.fundo_manchado}%</b>. ` +
    `Coração (1 nível) achado em <b>${res.coracao_achado}%</b> das casas. Palavras (2 níveis) achadas em <b>${res.palavras_achadas}%</b> ` +
    `(+${res.palavras_so_1nivel}% só 1 nível). <span style="opacity:.6">(${res.ms} ms)</span>`;
  window.ULTIMA_ANALISE = res;
  return res;
}
