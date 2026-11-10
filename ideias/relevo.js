// ---- Relevo genérico: mapa de profundidade → linhas de PALAVRAS de verdade ----------------
// Generaliza o truque gatos/gato + ato/rato. Cada linha recebe um perfil sep[x] = distância de
// repetição em cada coluna (P = fundo, P-1 = um nível à frente, P-2 = dois...). A linha é um
// SIRDS de texto: a primeira faixa [0,P) é livre e todo o resto copia text[x] = text[x - sep[x]].
//  - quando sep diminui em x (sobe um nível), a cópia PULA um caractere da origem. Ele tem que
//    ser a última letra de uma palavra (gatos→gato) OU a primeira (rato→ato).
//  - quando sep aumenta em x (desce um nível), entra um caractere NOVO: uma letra antes de uma
//    palavra (ato→rato) OU depois dela (gato→gatos).
// Uma corrida a seco com "ids" (de qual casa do pedaço cíclico de P caracteres cada caractere
// veio) diz onde cada palavra-chave tem que estar no pedaço; depois o pedaço é montado com essas
// palavras nessas casas e enfeites no resto. As duas opções por degrau dão folga pra caber.
// Planaltos podem ser mais LARGOS que P (o pedaço encurtado se repete a P-1) e níveis aninham.

function relevoLinha(sep, P, bancos, fixas = [], tentativas = 400) {
  const L = sep.length, ids = new Array(L), eventos = [];
  const mod = i => ((i % P) + P) % P;
  for (let x = 0; x < L; x++) {
    if (x < P) { if (sep[x] !== P) return { erro: 'faixa inicial precisa ser fundo' }; ids[x] = x; continue; }
    const d = sep[x] - sep[x - 1];
    if (Math.abs(d) > 1) return { erro: `degrau de ${d} em ${x}` };
    if (d === -1) eventos.push({ tipo: 'del', x, k: ids[x - sep[x - 1]], antes: ids[x - 1], depois: ids[x - sep[x]] });
    if (d === 1) { eventos.push({ tipo: 'ins', x, j: ids[x - 1], depois: ids[x - sep[x - 1]] }); ids[x] = 'F' + x; continue; }
    ids[x] = ids[x - sep[x]];
  }
  for (const e of eventos) {
    if (e.tipo === 'del' && (typeof e.k !== 'number' || e.antes !== mod(e.k - 1) || e.depois !== mod(e.k + 1))) return { erro: 'degrau sobre letra inserida' };
    if (e.tipo === 'ins' && (typeof e.j !== 'number' || e.depois !== mod(e.j + 1))) return { erro: 'degrau sobre letra inserida' };
  }
  const fixos = [];
  for (const f of fixas) {
    const id = ids[f.x];
    for (let k = 0; k < f.w.length; k++) if (ids[f.x + k] !== mod(id + k)) return { erro: 'palavra fixa sobre letra inserida' };
    fixos.push({ ini: id, s: f.w });
  }
  let melhor = null;
  for (let t = 0; t < tentativas; t++) {
    // cada degrau escolhe um jeito e uma palavra; item = { ini, s } no pedaço cíclico
    const ins = new Map();
    const itens = [...fixos, ...eventos.map(e => {
      if (e.tipo === 'del') {
        if (Math.random() < 0.5) { const A = pick(bancos.antes); return { ini: mod(e.k - A.longa.length + 1), s: A.longa }; } // gatos→gato
        const B = pick(bancos.depois); return { ini: e.k, s: B.longa };                                                     // rato→ato
      }
      if (Math.random() < 0.5) { const B = pick(bancos.depois); ins.set(e.x, B.longa[0]); return { ini: mod(e.j + 1), s: B.curta }; } // ato→rato
      const A = pick(bancos.antes); ins.set(e.x, A.longa.at(-1)); return { ini: mod(e.j - A.curta.length + 1), s: A.curta };      // gato→gatos
    })];
    const usados = new Set(itens.map(i => i.s));
    if (usados.size < itens.length) continue;                      // nada de palavra repetida
    const c = new Array(P).fill(null); let ok = true;
    for (const it of itens) for (let k = -1; k <= it.s.length && ok; k++) {   // palavra + espaço de cada lado
      const j = mod(it.ini + k), ch = k < 0 || k === it.s.length ? ' ' : it.s[k];
      if (c[j] !== null && c[j] !== ch) ok = false; c[j] = ch;
    }
    if (!ok || itens.length && it2(c)) continue;
    // buracos (corridas de casas vazias, sempre entre dois espaços): "w1 w2" em n casas = preencher(n + 1)
    const proib = new Set([...usados, ...bancos.proibidas]);
    if (!itens.length) { const pad = preencher(P, bancos.enfeites, proib); if (!pad) continue; [...(pad.join(' ') + ' ')].forEach((ch, j) => c[j] = ch); }
    let falha = false;
    for (let j = 0; j < P && !falha; j++) {
      if (c[j] !== null || c[mod(j - 1)] === null) continue;
      let n = 0; while (c[mod(j + n)] === null) n++;
      // primeiro só enfeites longos; se não fechar a conta, aceita palavras curtas (sol, eu, e)
      const pad = preencher(n + 1, bancos.enfeites, proib) || (bancos.curtas && preencher(n + 1, [...bancos.enfeites, ...bancos.curtas], proib));
      if (!pad) { falha = true; break; }
      pad.forEach(w => proib.add(w));
      [...pad.join(' ')].forEach((ch, i) => c[mod(j + i)] = ch);
    }
    const chunk = c.join('');
    if (falha || (chunk + chunk[0]).includes('  ')) continue;     // nada de espaço duplo
    const nota = mancha(chunk);
    if (!melhor || nota < melhor.nota) melhor = { chunk, ins, nota };
    if (nota === 0) break;
  }
  if (!melhor) return { erro: 'não coube' };
  // ids 'F<x>' (e suas cópias adiante) são a letra inserida em x
  const texto = ids.map(id => typeof id === 'number' ? melhor.chunk[id] : melhor.ins.get(Number(id.slice(1))));
  return { texto: texto.join(''), chunk: melhor.chunk, nota: melhor.nota, sep, ids };
}
// Palavras curtas: só pra fechar buracos pequenos que os enfeites longos não cobrem.
const CURTAS = lista(`e o a é de em um eu tu se já lá só pé nó dó mar sol céu rio lua pão mão voz luz chá
mel boi fim cor dia paz rei sal sim som tom vez`);
// dois espaços vizinhos já marcados = palavra grudada em outra sem casa pra enfeite
const it2 = c => c.some((ch, j) => ch === ' ' && c[(j + 1) % c.length] === ' ');

// conferência: toda coluna (fora as letras inseridas) repete na distância pedida
function conferirRelevo(texto, sep, P) {
  let ruins = 0;
  for (let x = P; x < texto.length; x++) {
    if (sep[x] > sep[x - 1]) continue;                 // letra nova
    if (texto[x] !== texto[x - sep[x]]) ruins++;
  }
  return ruins;
}

// toda palavra inteira da linha existe no vocabulário? (as pontas cortadas não contam)
function palavrasValidas(texto, vocab) {
  const toks = texto.split(' ').slice(1, -1).filter(Boolean);
  return toks.filter(w => !vocab.has(w));
}

if (typeof module !== 'undefined') module.exports = { relevoLinha, conferirRelevo, palavrasValidas };
