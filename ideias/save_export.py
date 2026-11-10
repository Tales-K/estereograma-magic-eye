import json, sys, base64
d = json.load(open(sys.argv[1]))['value']; pre = sys.argv[2]
for k in ('img', 'img14', 'mapa'):
    open(f'{pre}_{k}.png', 'wb').write(base64.b64decode(d[k].split(',')[1]))
print(pre, d['leitura'])
