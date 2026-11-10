"""Proxy for how strongly a wall 'invites' the eyes to lock at the base period P, at coarse
scale (what vergence uses before fine detail): blur the image, then compare the mean |I(x)-I(x-d)|
at d = P against the best competing lag d in [0.4P, 1.6P] outside P±15%.
ratio = err(best competitor) / err(P); bigger = more unambiguous lock. Reported for luminance
and for RGB (color difference), at two blur scales (sigma = 0.5 and 1.5 character widths)."""
import sys, numpy as np
from PIL import Image, ImageFilter
def run(path, P, cw):
    im = Image.open(path).convert('RGB'); out = {}
    for s in (0.5, 1.5):
        b = np.asarray(im.filter(ImageFilter.GaussianBlur(s * cw))).astype(float) / 255
        L = b @ [0.299, 0.587, 0.114]
        for name, A in (('lum', L[..., None]), ('rgb', b)):
            err = {d: np.abs(A[:, d:] - A[:, :-d]).sum(-1).mean() for d in range(int(.4 * P), int(1.6 * P))}
            comp = min(v for d, v in err.items() if abs(d - P) > .15 * P)
            out[f'{name}@{s}ch'] = round(comp / err[P], 2)
    return out
if __name__ == '__main__':
    P, cw = float(sys.argv[1]), float(sys.argv[2])
    for p in sys.argv[3:]: print(p, run(p, int(round(P)), cw))
