var LZWEncoder = function () {
    var c = {}, it = -1, st, ht, rt, l, w, et, ut = 12, ct = 5003, t, ft = ut, o, ot = 1 << ut, u = [], y = [], a = ct,
        s = 0, h = !1, v, f, p, i = 0, n = 0,
        vt = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535], r, g = [],
        lt = c.LZWEncoder = function lt(n, t, i, r) {
            st = n, ht = t, rt = i, l = Math.max(2, r)
        }, nt = function (n, t) {
            g[r++] = n, r >= 254 && k(t)
        }, at = function (n) {
            tt(a), s = f + 2, h = !0, e(f, n)
        }, tt = function (n) {
            for (var t = 0; t < n; ++t) u[t] = -1
        }, yt = c.compress = function yt(n, i) {
            var w, c, nt, l, rt, g, k;
            for (v = n, h = !1, t = v, o = b(t), f = 1 << n - 1, p = f + 1, s = f + 2, r = 0, l = d(), k = 0, w = a; w < 65536; w *= 2) ++k;
            k = 8 - k, g = a, tt(g), e(f, i);
            n:while ((nt = d()) != it) {
                if (w = (nt << ft) + l, c = nt << k ^ l, u[c] == w) {
                    l = y[c];
                    continue
                } else if (u[c] >= 0) {
                    rt = g - c, c == 0 && (rt = 1);
                    do if ((c -= rt) < 0 && (c += g), u[c] == w) {
                        l = y[c];
                        continue n
                    } while (u[c] >= 0)
                }
                e(l, i), l = nt, s < ot ? (y[c] = s++, u[c] = w) : at(i)
            }
            e(l, i), e(p, i)
        }, pt = c.encode = function (n) {
            n.writeByte(l), w = st * ht, et = 0, yt(l + 1, n), n.writeByte(0)
        }, k = function (n) {
            r > 0 && (n.writeByte(r), n.writeBytes(g, 0, r), r = 0)
        }, b = function (n) {
            return (1 << n) - 1
        }, d = function () {
            if (w == 0) return it;
            --w;
            var n = rt[et++];
            return n & 255
        }, e = function (r, u) {
            for (i &= vt[n], n > 0 ? i |= r << n : i = r, n += t; n >= 8;) nt(i & 255, u), i >>= 8, n -= 8;
            if ((s > o || h) && (h ? (o = b(t = v), h = !1) : (++t, o = t == ft ? ot : b(t))), r == p) {
                while (n > 0) nt(i & 255, u), i >>= 8, n -= 8;
                k(u)
            }
        };
    return lt.apply(this, arguments), c
};
var NeuQuant = function () {
    var c = {}, t = 256, tt = 499, nt = 491, rt = 487, it = 503, g = 3 * it, b = t - 1, r = 4, pt = 100, ft = 16,
        y = 1 << ft, p = 10, ii = 1 << p, a = 10, gt = y >> a, dt = y << p - a, ni = t >> 3, l = 6, ti = 1 << l,
        wt = ni * ti, kt = 30, ut = 10, e = 1 << ut, et, k = 8, d = 1 << k, bt = ut + k, u = 1 << bt, w, i, h, n,
        f = [], o = [], s = [], v = [], ht = c.NeuQuant = function ht(u, f, e) {
            var c, l;
            for (w = u, i = f, h = e, n = new Array(t), c = 0; c < t; c++) n[c] = new Array(4), l = n[c], l[0] = l[1] = l[2] = (c << r + 8) / t, s[c] = y / t, o[c] = 0
        }, ot = function () {
            for (var e = [], o = new Array(t), f, r, u, i = 0; i < t; i++) o[n[i][3]] = i;
            for (f = 0, r = 0; r < t; r++) u = o[r], e[f++] = n[u][0], e[f++] = n[u][1], e[f++] = n[u][2];
            return e
        }, ct = function () {
            var e, i, c, s, u, r, o, h;
            for (o = 0, h = 0, e = 0; e < t; e++) {
                for (u = n[e], c = e, s = u[1], i = e + 1; i < t; i++) r = n[i], r[1] < s && (c = i, s = r[1]);
                if (r = n[c], e != c && (i = r[0], r[0] = u[0], u[0] = i, i = r[1], r[1] = u[1], u[1] = i, i = r[2], r[2] = u[2], u[2] = i, i = r[3], r[3] = u[3], u[3] = i), s != o) {
                    for (f[o] = h + e >> 1, i = o + 1; i < s; i++) f[i] = e;
                    o = s, h = e
                }
            }
            for (f[o] = h + b >> 1, i = o + 1; i < 256; i++) f[i] = b
        }, vt = function () {
            var t, u, k, b, p, c, n, s, o, y, ut, a, f, ft;
            for (i < g && (h = 1), et = 30 + (h - 1) / 3, a = w, f = 0, ft = i, ut = i / (3 * h), y = ut / pt | 0, s = e, c = wt, n = c >> l, n <= 1 && (n = 0), t = 0; t < n; t++) v[t] = s * ((n * n - t * t) * d / (n * n));
            for (o = i < g ? 3 : i % tt != 0 ? 3 * tt : i % nt != 0 ? 3 * nt : i % rt != 0 ? 3 * rt : 3 * it, t = 0; t < ut;) if (k = (a[f + 0] & 255) << r, b = (a[f + 1] & 255) << r, p = (a[f + 2] & 255) << r, u = yt(k, b, p), at(s, u, k, b, p), n != 0 && lt(n, u, k, b, p), f += o, f >= ft && (f -= i), t++, y == 0 && (y = 1), t % y == 0) for (s -= s / et, c -= c / kt, n = c >> l, n <= 1 && (n = 0), u = 0; u < n; u++) v[u] = s * ((n * n - u * u) * d / (n * n))
        }, ri = c.map = function (i, r, u) {
            var c, l, e, o, h, s, a;
            for (h = 1e3, a = -1, c = f[r], l = c - 1; c < t || l >= 0;) c < t && (s = n[c], e = s[1] - r, e >= h ? c = t : (c++, e < 0 && (e = -e), o = s[0] - i, o < 0 && (o = -o), e += o, e < h && (o = s[2] - u, o < 0 && (o = -o), e += o, e < h && (h = e, a = s[3])))), l >= 0 && (s = n[l], e = r - s[1], e >= h ? l = -1 : (l--, e < 0 && (e = -e), o = s[0] - i, o < 0 && (o = -o), e += o, e < h && (o = s[2] - u, o < 0 && (o = -o), e += o, e < h && (h = e, a = s[3]))));
            return a
        }, ui = c.process = function () {
            return vt(), st(), ct(), ot()
        }, st = function () {
            for (var u, i = 0; i < t; i++) n[i][0] >>= r, n[i][1] >>= r, n[i][2] >>= r, n[i][3] = i
        }, lt = function (i, r, f, e, o) {
            var a, y, l, c, h, p, s;
            for (l = r - i, l < -1 && (l = -1), c = r + i, c > t && (c = t), a = r + 1, y = r - 1, p = 1; a < c || y > l;) {
                if (h = v[p++], a < c) {
                    s = n[a++];
                    try {
                        s[0] -= h * (s[0] - f) / u, s[1] -= h * (s[1] - e) / u, s[2] -= h * (s[2] - o) / u
                    } catch (w) {
                    }
                }
                if (y > l) {
                    s = n[y--];
                    try {
                        s[0] -= h * (s[0] - f) / u, s[1] -= h * (s[1] - e) / u, s[2] -= h * (s[2] - o) / u
                    } catch (w) {
                    }
                }
            }
        }, at = function (t, i, r, u, f) {
            var o = n[i];
            o[0] -= t * (o[0] - r) / e, o[1] -= t * (o[1] - u) / e, o[2] -= t * (o[2] - f) / e
        }, yt = function (i, u, f) {
            var h, c, e, b, d, l, k, v, w, y;
            for (v = 2147483647, w = v, l = -1, k = l, h = 0; h < t; h++) y = n[h], c = y[0] - i, c < 0 && (c = -c), e = y[1] - u, e < 0 && (e = -e), c += e, e = y[2] - f, e < 0 && (e = -e), c += e, c < v && (v = c, l = h), b = c - (o[h] >> ft - r), b < w && (w = b, k = h), d = s[h] >> a, s[h] -= d, o[h] += d << p;
            return s[l] += gt, o[l] -= dt, k
        };
    return ht.apply(this, arguments), c
};
var GIFEncoder = function () {
    function h() {
        this.bin = []
    }

    for (var c = 0, w = {}; c < 256; c++) w[c] = String.fromCharCode(c);
    h.prototype.getData = function () {
        for (var t = "", i = this.bin.length, n = 0; n < i; n++) t += w[this.bin[n]];
        return t
    }, h.prototype.writeByte = function (n) {
        this.bin.push(n)
    }, h.prototype.writeUTFBytes = function (n) {
        for (var i = n.length, t = 0; t < i; t++) this.writeByte(n.charCodeAt(t))
    }, h.prototype.writeBytes = function (n, t, i) {
        for (var u = i || n.length, r = t || 0; r < u; r++) this.writeByte(n[r])
    };
    var t = {}, o, s, v = null, g, k = -1, d = 0, f = !1, n, a, i, l, rt, r, ut = [], p = 7, y = -1, b = !1, e = !0,
        ft = !1, it = 10, gt = t.setDelay = function (n) {
            d = Math.round(n / 10)
        }, ni = t.setDispose = function (n) {
            n >= 0 && (y = n)
        }, dt = t.setRepeat = function (n) {
            n >= 0 && (k = n)
        }, bt = t.setTransparent = function (n) {
            v = n
        }, kt = t.addFrame = function (t, i) {
            if (t == null || !f || n == null) {
                throw new Error("Please call start method before calling addFrame");
                return !1
            }
            var r = !0;
            try {
                i ? a = t : (a = t.getImageData(0, 0, t.canvas.width, t.canvas.height).data, ft || et(t.canvas.width, t.canvas.height)), ct(), ht(), e && (vt(), tt(), k >= 0 && lt()), st(), ot(), e || tt(), at(), e = !1
            } catch (u) {
                r = !1
            }
            return r
        }, ui = t.finish = function () {
            if (!f) return !1;
            var t = !0;
            f = !1;
            try {
                n.writeByte(59)
            } catch (i) {
                t = !1
            }
            return t
        }, nt = function () {
            g = 0, a = null, i = null, l = null, r = null, b = !1, e = !0
        }, fi = t.setFrameRate = function (n) {
            n != 15 && (d = Math.round(100 / n))
        }, ri = t.setQuality = function (n) {
            n < 1 && (n = 1), it = n
        }, et = t.setSize = function et(n, t) {
            (!f || e) && (o = n, s = t, o < 1 && (o = 320), s < 1 && (s = 240), ft = !0)
        }, ti = t.start = function () {
            nt();
            var t = !0;
            b = !1, n = new h;
            try {
                n.writeUTFBytes("GIF89a")
            } catch (i) {
                t = !1
            }
            return f = t
        }, ii = t.cont = function () {
            nt();
            var t = !0;
            return b = !1, n = new h, f = t
        }, ht = function () {
            var e = i.length, o = e / 3, f, n, t, u;
            for (l = [], f = new NeuQuant(i, e, it), r = f.process(), n = 0, t = 0; t < o; t++) u = f.map(i[n++] & 255, i[n++] & 255, i[n++] & 255), ut[u] = !0, l[t] = u;
            i = null, rt = 8, p = 7, v != null && (g = yt(v))
        }, yt = function (n) {
            var t;
            if (r == null) return -1;
            var c = (n & 16711680) >> 16, v = (n & 65280) >> 8, a = n & 255, s = 0, h = 16777216, l = r.length;
            for (t = 0; t < l;) {
                var i = c - (r[t++] & 255), e = v - (r[t++] & 255), u = a - (r[t] & 255), f = i * i + e * e + u * u,
                    o = t / 3;
                ut[o] && f < h && (h = f, s = o), t++
            }
            return s
        }, ct = function () {
            var e = o, h = s, f, u, t, r, n;
            for (i = [], f = a, u = 0, t = 0; t < h; t++) for (r = 0; r < e; r++) n = t * e * 4 + r * 4, i[u++] = f[n], i[u++] = f[n + 1], i[u++] = f[n + 2]
        }, st = function () {
            n.writeByte(33), n.writeByte(249), n.writeByte(4);
            var i, t;
            v == null ? (i = 0, t = 0) : (i = 1, t = 2), y >= 0 && (t = y & 7), t <<= 2, n.writeByte(0 | t | 0 | i), u(d), n.writeByte(g), n.writeByte(0)
        }, ot = function () {
            n.writeByte(44), u(0), u(0), u(o), u(s), e ? n.writeByte(0) : n.writeByte(128 | p)
        }, vt = function () {
            u(o), u(s), n.writeByte(240 | p), n.writeByte(0), n.writeByte(0)
        }, lt = function () {
            n.writeByte(33), n.writeByte(255), n.writeByte(11), n.writeUTFBytes("NETSCAPE2.0"), n.writeByte(3), n.writeByte(1), u(k), n.writeByte(0)
        }, tt = function () {
            var i, t;
            for (n.writeBytes(r), i = 768 - r.length, t = 0; t < i; t++) n.writeByte(0)
        }, u = function (t) {
            n.writeByte(t & 255), n.writeByte(t >> 8 & 255)
        }, at = function () {
            var t = new LZWEncoder(o, s, l, rt);
            t.encode(n)
        }, wt = t.stream = function () {
            return n
        }, pt = t.setProperties = function (n, t) {
            f = n, e = t
        };
    return t
};

module.exports = {
    LZWEncoder: LZWEncoder,
    NeuQuant: NeuQuant,
    GIFEncoder: GIFEncoder
};

