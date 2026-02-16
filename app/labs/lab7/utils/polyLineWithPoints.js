import * as d3 from 'd3';
var _0x4660c9 = _0x24a8;
(function (t, e) {
  for (var r = _0x24a8, a = _0x3e9e(); ; )
    try {
      if (
        507483 ==
        -parseInt(r(233)) / 1 +
          -parseInt(r(232)) / 2 +
          (parseInt(r(208)) / 3) * (-parseInt(r(157)) / 4) +
          -parseInt(r(244)) / 5 +
          (-parseInt(r(215)) / 6) * (-parseInt(r(188)) / 7) +
          (-parseInt(r(235)) / 8) * (-parseInt(r(190)) / 9) +
          (parseInt(r(249)) / 10) * (parseInt(r(239)) / 11)
      )
        break;
      a.push(a.shift());
    } catch (t) {
      a.push(a.shift());
    }
})();
import { createMarkers, renderVectors, translateVectors } from "./helpers.js";
import { symbols } from "./symbols.js";
function _0x3e9e() {
  var t = [
    "Toggling between Polar/Cartesian!",
    "height",
    "#vector0-2-1",
    "cos",
    "#vector1-4-1",
    "textContent",
    "vc0",
    "#vector0-1-1",
    "1350250xzVmnh",
    "755468lIvIVT",
    "va1",
    "27080BpNvFa",
    "target",
    "vb5",
    "translate(",
    "47113tpgrzy",
    "select",
    "vector0",
    "ve3",
    "#numPhases",
    "149480bcngtS",
    "vector2",
    "vb3",
    "log",
    "vectora",
    "5210OqXizH",
    "#vector0-3-1",
    "fromCharCode",
    "translate(0,-75)",
    "min",
    "drag",
    "#vector0-0-1",
    "vc1",
    "vector3",
    "#vector4-5-1",
    "#vector3-1-1",
    "#vector3-3-1",
    "start",
    "addEventListener",
    "#vector2-0-1",
    "in Polar",
    "sin",
    "value",
    "#vector3-5-1",
    "map",
    "vb0",
    "vector1",
    "#vector4-1-1",
    "vd4",
    "vf0",
    "#vector5-2-1",
    "Sequence ",
    "attr",
    "vc5",
    "#vector5-0-1",
    "#vector5-4-1",
    "toFixed",
    "forEach",
    "vc2",
    "in Cartesian",
    "2554752RmeuQb",
    " = 0",
    "vd2",
    "remove",
    "vd1",
    "selectAll",
    "vf3",
    "vb2",
    "transform",
    "function",
    "#vis_g1",
    "click",
    "vis_g",
    " = ",
    "ve1",
    "#vector0-5-1",
    "sqrt",
    "append",
    "ve5",
    "ve4",
    "vector5",
    "0 0 ",
    "ve0",
    "text",
    "vectorf",
    "vf4",
    "translate(0, 0)",
    "#vector0-4-1",
    "#vector1-1-1",
    "#vector3-2-1",
    "#vector4-3-1",
    "497SPogYa",
    "push",
    "396QpcAHT",
    "#vector2-3-1",
    "vectore",
    "#vector2-1-1",
    "max",
    "width",
    "vectorb",
    "vectorc",
    "vc4",
    "#vector1-0-1",
    "entries",
    "va0",
    "#vector1-5-1",
    "vb1",
    "#vector3-4-1",
    "updateVectors",
    "vis_g1",
    "__origin__",
    "3dBrofc",
    "vd3",
    "va5",
    "#vector4-2-1",
    "#vector2-2-1",
    "vector4",
    "va3",
    "19122AAkuAt",
    "values",
    "viewBox",
    "#vector4-0-1",
    "vec",
    "vf1",
    ": V",
    "#vector1-2-1",
    "vb4",
  ];
  return (_0x3e9e = function () {
    return t;
  })();
}
import { equationsDisplayed } from "./illustrativeKaTexEquations.mjs";
import { createMatrix } from "./createMatrix.mjs";
function _0x24a8(t, e) {
  var r = _0x3e9e();
  return (_0x24a8 = function (t, e) {
    return r[(t -= 125)];
  })(t, e);
}
import { multiplyMatrices } from "./ComplexOperatorAid.mjs";
function VectorInputs(t, e) {
  var r = _0x4660c9;
  t[r(149)](r(195), width_vis)
    .attr(r(225), h)
    [r(149)](r(217), r(178) + width_vis + " " + h);
  var a = t.append("g"),
    i = a[r(174)]("g")
      [r(149)](r(195), 275)
      [r(149)]("height", 275)
      [r(149)]("id", r(206));
  const s = [],
    v = [2, 3, 4, 5, 6, 7];
  for (let t = 0; t < e; t++) {
    const e = a[r(174)]("g")[r(149)]("id", r(169) + v[t]),
      i = [-250, 0, 250, -250, 0, 250][t] ?? void 0,
      o = t >= 3 ? 300 : 0;
    (e[r(149)](r(165), r(238) + (width_vis / 2 + 75 + o) + ", " + i + ")"),
      s[r(189)](e));
  }
  (i.attr(r(165), r(183)), symbols(a, width_vis, 275));
  const o = [];
  for (let t = 0; t < e; t++) o[r(189)]("mark" + String[r(251)](97 + t));
  for (let t = 0; t < e; t++) o[r(189)]("mark" + t);
  createMarkers(a, o);
  var d = 275 / Math[r(173)](3) - 82.5,
    f = 237.5,
    c = 337.5,
    n = [f, c],
    l = {},
    u = {};
  for (let t = 0; t < e; t++) {
    const a = (2 * Math.PI * t) / e,
      i = "v" + String.fromCharCode(97 + t);
    ((l[i] = [f + d * Math[r(227)](a), c - d * Math.sin(a)]),
      (u["ps" + String[r(251)](97 + t)] = [l[i]]));
  }
  const _ = l;
  Object[r(200)](_).forEach(([t, e]) => {
    globalThis[t] = e;
  });
  const V = u;
  Object[r(200)](V)[r(154)](([t, e]) => {
    globalThis[t] = e;
  });
  const w = [];
  for (let t = 0; t < e; t++) {
    const e = -150,
      i = c - [e, e + 250, e + 465, e, e + 250, e + 465][t] ?? void 0,
      s = t >= 3 ? 350 : 0,
      v = a[r(174)]("text")
        [r(149)]("x", width_vis / 2 + 275 / 1.5 + s)
        [r(149)]("y", i)
        [r(149)]("class", "Sequence" + t)
        [r(180)](r(148) + t + r(221) + t + r(158));
    w[r(189)](v);
  }
  function p(t, e) {
    return [t[0] * e[0] - t[1] * e[1], t[1] * e[0] + t[0] * e[1]];
  }
  const g = (function (t) {
    var e = r;
    let a = {};
    for (let r = 0; r < t; r++)
      a["alpha" + (1 === r ? "" : r)] = [
        Math[e(227)]((2 * Math.PI * r) / t),
        -Math[e(138)]((2 * Math.PI * r) / t),
      ];
    return a;
  })(e);
  Object[r(200)](g)[r(154)](([t, e]) => {
    globalThis[t] = e;
  });
  const b = createMatrix(e);
  function x(t, e, r) {
    return [
      [t[0], t[1]],
      [e[0], e[1]],
      [r[0], r[1]],
    ];
  }
  function m(t, e, r, a, i, s) {
    return [
      [t[0], t[1]],
      [e[0], e[1]],
      [r[0], r[1]],
      [a[0], a[1]],
      [i[0], i[1]],
      [s[0], s[1]],
    ];
  }
  function R(t, e) {
    let r = {};
    for (const [a, i] of Object.entries(t)) r[a] = [i[0] + e[0], i[1] + e[1]];
    return r;
  }
  var M = function () {
    var t = r;
    let dataRef, diff1, diff2, diff3, diff4, diff5, diff6, diff7, toggleCartesianBtnStatus;
    const a = (function (t) {
      var e = _0x24a8;
      let r = {};
      for (let s = 0; s < t; s++) {
        const t = "v" + String.fromCharCode(97 + s),
          v = e(219) + String[e(251)](97 + s);
        ((r[v] = null),
          (r[v] = ((a = l[t]), (i = n), [a[0] - i[0], a[1] - i[1]])));
      }
      var a, i;
      return r;
    })(e);
    Object[t(200)](a).forEach(([t, e]) => {
      globalThis[t] = e;
    });
    const v = Object[t(216)](a)[t(141)]((t) => [t]),
      o = multiplyMatrices(b, v);
    if (3 === e) {
      var d = p((et = o[2][0]), alpha2),
        u = p(et, alpha);
      w[2][t(180)](
        "V2 = " +
          Math[t(173)](et[0] * et[0] * 1 + et[1] * et[1] * 1)[t(153)](3),
      );
      const e = R({ va2: et, vb2: d, vc2: u }, [0, 0]);
      ((et = [et[0] + f, et[1] + c]),
        (d = [d[0] + f, d[1] + c]),
        (u = [u[0] + f, u[1] + c]));
      var _ = [et, d, u],
        V = [e.va2, e[t(164)], e.vc2];
      let r = x(n, n, n);
      var g = p((st = o[1][0]), alpha),
        S = p(st, alpha2);
      w[1][t(180)](
        "V1" +
          t(170) +
          Math[t(173)](st[0] * st[0] * 1 + st[1] * st[1] * 1)[t(153)](3),
      );
      const a = R({ va1: st, vb1: g, vc1: S }, n);
      ((st = [st[0] + et[0], st[1] + et[1]]),
        (g = [g[0] + d[0], g[1] + d[1]]),
        (S = [S[0] + u[0], S[1] + u[1]]));
      var I = [st, g, S],
        C = [a.va1, a[t(203)], a[t(129)]];
      let i = x(et, d, u);
      var y = (ft = o[0][0]),
        j = ft;
      w[0].text(
        "V0 = " +
          Math[t(173)](ft[0] * ft[0] * 1 + ft[1] * ft[1] * 1)[t(153)](3),
      );
      const s = R({ va0: ft, vb0: y, vc0: j }, n);
      var q = [
          (ft = [ft[0] + st[0], ft[1] + st[1]]),
          (y = [y[0] + g[0], y[1] + g[1]]),
          (j = [j[0] + S[0], j[1] + S[1]]),
        ],
        B = [s.va0, s[t(142)], s[t(230)]];
      let v = x(st, g, S);
      dataRef = [r, i, v];
    } else {
      var G = o[5][0],
        P = p(G, alpha5),
        O = p(G, alpha4),
        T = p(G, alpha3),
        k = p(G, alpha2),
        A = p(G, alpha);
      w[5].text(
        "V5" + t(170) + Math.sqrt(G[0] * G[0] * 1 + G[1] * G[1] * 1)[t(153)](3),
      );
      const e = R({ va5: G, vb5: P, vc5: O, vd5: T, ve5: k, vf5: A }, [0, 0]);
      ((G = [G[0] + f, G[1] + c]),
        (P = [P[0] + f, P[1] + c]),
        (O = [O[0] + f, O[1] + c]),
        (T = [T[0] + f, T[1] + c]),
        (k = [k[0] + f, k[1] + c]),
        (A = [A[0] + f, A[1] + c]));
      var E = [G, P, O, T, k, A];
      (e[t(210)], e[t(237)], e[t(150)], e.vd5, e[t(175)], e.vf5);
      let r = m(n, n, n, n, n, n);
      var F = o[4][0],
        z = p(F, alpha4),
        D = p(F, alpha2),
        H = p(F, alpha0),
        Q = p(F, alpha4),
        K = p(F, alpha2);
      w[4][t(180)](
        "V4 = " + Math.sqrt(F[0] * F[0] * 1 + F[1] * F[1] * 1)[t(153)](3),
      );
      const a = R({ va4: F, vb4: z, vc4: D, vd4: H, ve4: Q, vf4: K }, n);
      ((F = [F[0] + G[0], F[1] + G[1]]),
        (z = [z[0] + P[0], z[1] + P[1]]),
        (D = [D[0] + O[0], D[1] + O[1]]),
        (H = [H[0] + T[0], H[1] + T[1]]),
        (Q = [Q[0] + k[0], Q[1] + k[1]]),
        (K = [K[0] + A[0], K[1] + A[1]]));
      var L = [F, z, D, H, Q, K],
        N = [a.va4, a[t(223)], a[t(198)], a[t(145)], a[t(176)], a[t(182)]];
      let i = m(G, P, O, T, k, A);
      var X = o[3][0],
        Y = p(X, alpha3),
        J = p(X, alpha0),
        U = p(X, alpha3),
        W = p(X, alpha0),
        Z = p(X, alpha3);
      w[3].text(
        "V3" +
          t(170) +
          Math[t(173)](X[0] * X[0] * 1 + X[1] * X[1] * 1).toFixed(3),
      );
      const s = R({ va3: X, vb3: Y, vc3: J, vd3: U, ve3: W, vf3: Z }, n);
      ((X = [X[0] + F[0], X[1] + F[1]]),
        (Y = [Y[0] + z[0], Y[1] + z[1]]),
        (J = [J[0] + D[0], J[1] + D[1]]),
        (U = [U[0] + H[0], U[1] + H[1]]),
        (W = [W[0] + Q[0], W[1] + Q[1]]),
        (Z = [Z[0] + K[0], Z[1] + K[1]]));
      var $ = [X, Y, J, U, W, Z],
        tt = [s[t(214)], s[t(246)], s.vc3, s[t(209)], s[t(242)], s[t(163)]];
      let v = m(F, z, D, H, Q, K);
      ((d = p((et = o[2][0]), alpha2)), (u = p(et, alpha4)));
      var et,
        rt = p(et, alpha0),
        at = p(et, alpha2),
        it = p(et, alpha4);
      w[2][t(180)](
        "V2" +
          t(170) +
          Math[t(173)](et[0] * et[0] * 1 + et[1] * et[1] * 1)[t(153)](3),
      );
      const l = R({ va2: et, vb2: d, vc2: u, vd2: rt, ve2: at, vf2: it }, n);
      ((et = [et[0] + X[0], et[1] + X[1]]),
        (d = [d[0] + Y[0], d[1] + Y[1]]),
        (u = [u[0] + J[0], u[1] + J[1]]),
        (rt = [rt[0] + U[0], rt[1] + U[1]]),
        (at = [at[0] + W[0], at[1] + W[1]]),
        (it = [it[0] + Z[0], it[1] + Z[1]]),
        (_ = [et, d, u, rt, at, it]),
        (V = [l.va2, l.vb2, l[t(155)], l[t(159)], l.ve2, l.vf2]));
      let h = m(X, Y, J, U, W, Z);
      ((g = p((st = o[1][0]), alpha)), (S = p(st, alpha2)));
      var st,
        vt = p(st, alpha3),
        ot = p(st, alpha4),
        dt = p(st, alpha5);
      w[1].text(
        "V1" +
          t(170) +
          Math[t(173)](st[0] * st[0] * 1 + st[1] * st[1] * 1).toFixed(3),
      );
      const b = R({ va1: st, vb1: g, vc1: S, vd1: vt, ve1: ot, vf1: dt }, n);
      ((st = [st[0] + et[0], st[1] + et[1]]),
        (g = [g[0] + d[0], g[1] + d[1]]),
        (S = [S[0] + u[0], S[1] + u[1]]),
        (vt = [vt[0] + rt[0], vt[1] + rt[1]]),
        (ot = [ot[0] + at[0], ot[1] + at[1]]),
        (dt = [dt[0] + it[0], dt[1] + it[1]]),
        (I = [st, g, S, vt, ot, dt]),
        (C = [b[t(234)], b.vb1, b.vc1, b[t(161)], b[t(171)], b[t(220)]]));
      let x = m(et, d, u, rt, at, it);
      ((y = ft = o[0][0]), (j = ft));
      var ft,
        ct = ft,
        nt = ft,
        lt = ft;
      w[0].text(
        "V0" +
          t(170) +
          Math.sqrt(ft[0] * ft[0] * 1 + ft[1] * ft[1] * 1)[t(153)](3),
      );
      const M = R({ va0: ft, vb0: y, vc0: j, vd0: ct, ve0: nt, vf0: lt }, n);
      ((q = [
        (ft = [ft[0] + st[0], ft[1] + st[1]]),
        (y = [y[0] + g[0], y[1] + g[1]]),
        (j = [j[0] + S[0], j[1] + S[1]]),
        (ct = [ct[0] + vt[0], ct[1] + vt[1]]),
        (nt = [nt[0] + ot[0], nt[1] + ot[1]]),
        (lt = [lt[0] + dt[0], lt[1] + dt[1]]),
      ]),
        (B = [M[t(201)], M[t(142)], M.vc0, M.vd0, M[t(179)], M[t(146)]]));
      let ht = m(st, g, S, vt, ot, dt);
      dataRef = [r, i, v, h, x, ht];
    }
    var ht = d3[t(127)]()
      .on(t(134), function (e, r) {
        this[t(207)] = r.slice();
      })
      .on(t(127), function (e, r) {
        var a = t;
        ((r[0] = Math.max(
          0,
          Math.min((this.__origin__[0] += e.dx), width_vis),
        )),
          (r[1] = Math[a(194)](0, Math[a(126)]((this[a(207)][1] += e.dy), h))),
          M());
      })
      .on("end", function () {
        delete this[t(207)];
      });
    if (3 === e) {
      var ut = psa,
        _t = [veca];
      renderVectors(i, ut, _t, t(248), dataRef, ht, !1, 1);
      var Vt = psb,
        wt = [vecb];
      renderVectors(i, Vt, wt, t(196), dataRef, ht, !1, 1);
      var pt = psc,
        gt = [vecc];
      (renderVectors(i, pt, gt, t(197), dataRef, ht, !1, 1),
        renderVectors(i, (Ot = _), (Tt = []), t(245), dataRef, ht, !0, 1),
        renderVectors(s[0], Ot, Tt, t(245), dataRef, ht, !0, 0));
      var bt = C;
      (renderVectors(i, I, (kt = []), t(143), dataRef, ht, !0, 1),
        renderVectors(s[1], bt, kt, t(143), dataRef, ht, !0, 0));
      var xt = B;
      (renderVectors(i, q, (At = []), t(241), dataRef, ht, !0, 1),
        renderVectors(s[2], xt, At, "vector0", dataRef, ht, !0, 0));
    } else {
      ((ut = psa),
        (_t = [veca]),
        renderVectors(i, ut, _t, "vectora", dataRef, ht, !1, 1),
        (Vt = psb),
        (wt = [vecb]),
        renderVectors(i, Vt, wt, t(196), dataRef, ht, !1, 1),
        (pt = psc),
        (gt = [vecc]),
        renderVectors(i, pt, gt, t(197), dataRef, ht, !1, 1));
      var mt = psd,
        Rt = [vecd];
      renderVectors(i, mt, Rt, "vectord", dataRef, ht, !1, 1);
      var Mt = pse,
        St = [vece];
      renderVectors(i, Mt, St, t(192), dataRef, ht, !1, 1);
      var It = psf,
        Ct = [vecf];
      renderVectors(i, It, Ct, t(181), dataRef, ht, !1, 1);
      var yt = E,
        jt = [];
      (renderVectors(i, yt, jt, t(177), dataRef, ht, !0, 1),
        renderVectors(s[3], yt, jt, t(177), dataRef, ht, !0, 0));
      var qt = N,
        Bt = [];
      (renderVectors(i, L, Bt, t(213), dataRef, ht, !0, 1),
        renderVectors(s[4], qt, Bt, "vector4", dataRef, ht, !0, 0));
      var Gt = tt,
        Pt = [];
      (renderVectors(i, $, Pt, t(130), dataRef, ht, !0, 1),
        renderVectors(s[5], Gt, Pt, "vector3", dataRef, ht, !0, 0));
      var Ot,
        Tt,
        kt,
        At,
        Et = V;
      (renderVectors(i, (Ot = _), (Tt = []), t(245), dataRef, ht, !0, 1),
        renderVectors(s[0], Et, Tt, "vector2", dataRef, ht, !0, 0),
        (bt = C),
        renderVectors(i, I, (kt = []), "vector1", dataRef, ht, !0, 1),
        renderVectors(s[1], bt, kt, "vector1", dataRef, ht, !0, 0),
        (xt = B),
        renderVectors(i, q, (At = []), t(241), dataRef, ht, !0, 1),
        renderVectors(s[2], xt, At, t(241), dataRef, ht, !0, 0));
    }
    ((diff1 = [
      [et[0] - f, et[1] - c],
      [d[0] - f, d[1] - c],
      [u[0] - f, u[1] - c],
    ]),
      (diff2 = [
        [st[0] - f, st[1] - c],
        [g[0] - f, g[1] - c],
        [S[0] - f, S[1] - c],
      ]));
    d3[t(240)]("#triggerButton").on(t(168), function () {
      var r = t;
      (6 === e &&
        ((diff3 = [
          [G[0] - f, G[1] - c],
          [P[0] - f, P[1] - c],
          [O[0] - f, O[1] - c],
          [T[0] - f, T[1] - c],
          [k[0] - f, k[1] - c],
          [A[0] - f, A[1] - c],
        ]),
        (diff4 = [
          [F[0] - f, F[1] - c],
          [z[0] - f, z[1] - c],
          [D[0] - f, D[1] - c],
          [H[0] - f, H[1] - c],
          [Q[0] - f, Q[1] - c],
          [K[0] - f, K[1] - c],
        ]),
        (diff5 = [
          [X[0] - f, X[1] - c],
          [Y[0] - f, Y[1] - c],
          [J[0] - f, J[1] - c],
          [U[0] - f, U[1] - c],
          [W[0] - f, W[1] - c],
          [Z[0] - f, Z[1] - c],
        ]),
        (diff6 = [
          [et[0] - f, et[1] - c],
          [d[0] - f, d[1] - c],
          [u[0] - f, u[1] - c],
          [rt[0] - f, rt[1] - c],
          [at[0] - f, at[1] - c],
          [it[0] - f, it[1] - c],
        ]),
        (diff7 = [
          [st[0] - f, st[1] - c],
          [g[0] - f, g[1] - c],
          [S[0] - f, S[1] - c],
          [vt[0] - f, vt[1] - c],
          [ot[0] - f, ot[1] - c],
          [dt[0] - f, dt[1] - c],
        ]),
        translateVectors({
          selectorGroup: d3.select(r(167)),
          cloneSelectors: [
            r(151),
            "#vector5-1-1",
            r(147),
            "#vector5-3-1",
            r(152),
            "#vector5-5-1",
          ],
          translateValues: [
            [width_vis / 2 + 375, -250],
            [width_vis / 2 + 375, -250],
            [width_vis / 2 + 375, -250],
            [width_vis / 2 + 375, -250],
            [width_vis / 2 + 375, -250],
            [width_vis / 2 + 375, -250],
          ],
          duration: 2e3,
        }),
        translateVectors({
          selectorGroup: d3[r(240)](r(167)),
          cloneSelectors: [
            r(218),
            r(144),
            r(211),
            r(187),
            "#vector4-4-1",
            r(131),
          ],
          translateValues: [
            [width_vis / 2 + 375 - diff3[0][0], 0 - diff3[0][1]],
            [width_vis / 2 + 375 - diff3[1][0], 0 - diff3[1][1]],
            [width_vis / 2 + 375 - diff3[2][0], 0 - diff3[2][1]],
            [width_vis / 2 + 375 - diff3[3][0], 0 - diff3[3][1]],
            [width_vis / 2 + 375 - diff3[4][0], 0 - diff3[4][1]],
            [width_vis / 2 + 375 - diff3[5][0], 0 - diff3[5][1]],
          ],
          duration: 3e3,
        }),
        translateVectors({
          selectorGroup: d3[r(240)]("#vis_g1"),
          cloneSelectors: [
            "#vector3-0-1",
            r(132),
            r(186),
            r(133),
            r(204),
            r(140),
          ],
          translateValues: [
            [width_vis / 2 + 375 - diff4[0][0], 250 - diff4[0][1]],
            [width_vis / 2 + 375 - diff4[1][0], 250 - diff4[1][1]],
            [width_vis / 2 + 375 - diff4[2][0], 250 - diff4[2][1]],
            [width_vis / 2 + 375 - diff4[3][0], 250 - diff4[3][1]],
            [width_vis / 2 + 375 - diff4[4][0], 250 - diff4[4][1]],
            [width_vis / 2 + 375 - diff4[5][0], 250 - diff4[5][1]],
          ],
          duration: 4e3,
        }),
        translateVectors({
          selectorGroup: d3[r(240)](r(167)),
          cloneSelectors: [
            r(136),
            r(193),
            r(212),
            r(191),
            "#vector2-4-1",
            "#vector2-5-1",
          ],
          translateValues: [
            [width_vis / 2 + 75 - diff5[0][0], -250 - diff5[0][1]],
            [width_vis / 2 + 75 - diff5[1][0], -250 - diff5[1][1]],
            [width_vis / 2 + 75 - diff5[2][0], -250 - diff5[2][1]],
            [width_vis / 2 + 75 - diff5[3][0], -250 - diff5[3][1]],
            [width_vis / 2 + 75 - diff5[4][0], -250 - diff5[4][1]],
            [width_vis / 2 + 75 - diff5[5][0], -250 - diff5[5][1]],
          ],
          duration: 5e3,
        }),
        translateVectors({
          selectorGroup: d3.select("#vis_g1"),
          cloneSelectors: [
            r(199),
            r(185),
            r(222),
            "#vector1-3-1",
            r(228),
            r(202),
          ],
          translateValues: [
            [width_vis / 2 + 75 - diff6[0][0], 0 - diff6[0][1]],
            [width_vis / 2 + 75 - diff6[1][0], 0 - diff6[1][1]],
            [width_vis / 2 + 75 - diff6[2][0], 0 - diff6[2][1]],
            [width_vis / 2 + 75 - diff6[3][0], 0 - diff6[3][1]],
            [width_vis / 2 + 75 - diff6[4][0], 0 - diff6[4][1]],
            [width_vis / 2 + 75 - diff6[5][0], 0 - diff6[5][1]],
          ],
          duration: 6e3,
        }),
        translateVectors({
          selectorGroup: d3[r(240)](r(167)),
          cloneSelectors: [r(128), r(231), r(226), r(250), r(184), r(172)],
          translateValues: [
            [width_vis / 2 + 75 - diff7[0][0], 250 - diff7[0][1]],
            [width_vis / 2 + 75 - diff7[1][0], 250 - diff7[1][1]],
            [width_vis / 2 + 75 - diff7[2][0], 250 - diff7[2][1]],
            [width_vis / 2 + 75 - diff7[3][0], 250 - diff7[3][1]],
            [width_vis / 2 + 75 - diff7[4][0], 250 - diff7[4][1]],
            [width_vis / 2 + 75 - diff7[5][0], 250 - diff7[5][1]],
          ],
          duration: 7e3,
        })),
        3 === e &&
          (translateVectors({
            selectorGroup: d3[r(240)](r(167)),
            cloneSelectors: [r(136), r(193), r(212)],
            translateValues: [
              [width_vis / 2 + 75, -250],
              [width_vis / 2 + 75, -250],
              [width_vis / 2 + 75, -250],
            ],
            duration: 2e3,
          }),
          translateVectors({
            selectorGroup: d3[r(240)](r(167)),
            cloneSelectors: [r(199), r(185), r(222)],
            translateValues: [
              [width_vis / 2 + 75 - diff1[0][0], 0 - diff1[0][1]],
              [width_vis / 2 + 75 - diff1[1][0], 0 - diff1[1][1]],
              [width_vis / 2 + 75 - diff1[2][0], 0 - diff1[2][1]],
            ],
            duration: 4e3,
          }),
          translateVectors({
            selectorGroup: d3[r(240)](r(167)),
            cloneSelectors: [r(128), r(231), r(226)],
            translateValues: [
              [width_vis / 2 + 75 - diff2[0][0], 250 - diff2[0][1]],
              [width_vis / 2 + 75 - diff2[1][0], 250 - diff2[1][1]],
              [width_vis / 2 + 75 - diff2[2][0], 250 - diff2[2][1]],
            ],
            duration: 6e3,
          })));
    });
  };
  (M(),
    d3[r(240)](r(243)).on("change", function (a) {
      var i = r;
      ((e = 1 * a[i(236)][i(139)]),
        t[i(162)]("*")[i(160)](),
        VectorInputs(t, e),
        equationsDisplayed(t, e));
    }),
    a[r(149)](r(165), r(125)),
    t[r(149)](r(195), 0.7 * width_vis),
    (window.updateVectors = M));
}
(equationsDisplayed(window.vis, numPhases),
  VectorInputs(window.vis, 3),
  toggleCartesianBtn[_0x4660c9(135)](_0x4660c9(168), (t) => {
    var e = _0x4660c9;
    (console[e(247)](e(224)),
      toggleCartesianBtnStatus === e(156)
        ? ((toggleCartesianBtnStatus = e(137)),
          (toggleCartesianBtn[e(229)] = e(156)))
        : ((toggleCartesianBtnStatus = e(156)),
          (toggleCartesianBtn[e(229)] = e(137))),
      typeof window[e(205)] === e(166) && window[e(205)]());
  }));
