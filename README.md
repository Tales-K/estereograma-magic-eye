# Estereograma de Palavras

Uma página só (`index.html`, sem servidor nem dependências) que esconde uma frase num
estereograma de texto: cada palavra fica numa linha, no meio de palavras aleatórias, e salta em 3D
quando você desfoca os olhos (olhar paralelo) ou cruza os olhos (olhar cruzado).

## Como funciona

- Cada linha repete um pedaço de P caracteres. A palavra escondida fica entre duas vizinhas: a de
  antes perde a última letra e a de depois ganha uma no começo (`gatos o ato` → `gato o rato`).
  Assim só a palavra passa a repetir a cada P−1 e flutua à frente. No olhar cruzado é o contrário
  (P+1).
- Blocos coloridos acompanham cada palavra e se repetem junto com o texto, pra ajudar os olhos a
  travarem na repetição.
- A página desenha a parede como imagem e roda um decodificador que só olha pixels (o mesmo tipo
  usado em fotos de estereogramas), mostrando o mapa de profundidade e quanto do fundo ficou
  "manchado".

## Usar

Abra o `index.html` no navegador, digite a frase e use os dois pontos pretos do meio pra alinhar o
olhar. O controle de tamanho mostra a largura de cada repetição em cm; entre 3 e 5 cm costuma ser o
mais fácil pra olhar paralelo.

A pasta `ideias/` tem protótipos (coração escondido, "Magic Eye" colorido) e as análises deles.
