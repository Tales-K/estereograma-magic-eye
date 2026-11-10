// one wall + its decoded depth map as PNG data URLs (page's own functions)
const frase = window.EVAL_FRASE || 'o gato subiu no telhado';
const r = gerar(frase); mostrarAnalise(r);
return { leitura: document.getElementById('leitura').textContent,
  img: desenhar(r.linhas, typeof fonteImagem === 'function' ? fonteImagem(r) : 20, colunasGuia(r)).cv.toDataURL('image/png'),
  img14: desenhar(r.linhas, 14, colunasGuia(r)).cv.toDataURL('image/png'),
  mapa: document.getElementById('mapa').toDataURL('image/png'), P: r.P };
