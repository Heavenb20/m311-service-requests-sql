// MC311 dashboard: draws every chart from window.MC311 (dashboard/data.js).
(function () {
  var D = window.MC311;
  if (!D) return;
  var NS = 'http://www.w3.org/2000/svg';
  var css = getComputedStyle(document.documentElement);
  var C = {
    accent: css.getPropertyValue('--accent').trim(),
    compare: css.getPropertyValue('--compare').trim(),
    rest: css.getPropertyValue('--rest').trim()
  };
  var fmt = new Intl.NumberFormat('en-US');
  var pct1 = function (v) { return v.toFixed(1) + '%'; };
  var tip = document.getElementById('tip');

  // ---- KPIs ----
  var T = D.totals;
  document.querySelectorAll('[data-total]').forEach(function (el) { el.textContent = fmt.format(T[el.dataset.total]); });
  document.getElementById('kpi-ontime').textContent = pct1((1 - T.late / T.closed_with_deadline) * 100);
  document.getElementById('kpi-dot').textContent = Math.round(T.dot_late / T.late * 100) + '%';

  // ---- helpers ----
  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  // Draw each chart at its real on-screen width so text stays a readable size on phones
  function widthOf(id) { return Math.max(300, Math.round(document.getElementById(id).clientWidth)); }
  function narrow(id) { return widthOf(id) < 520; }
  function svg(w, h, label) { return el('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': label }); }
  function niceMax(v) {
    var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }
  function hover(node, text) {
    node.addEventListener('pointermove', function (e) {
      tip.textContent = text; tip.hidden = false;
      var x = Math.min(e.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
      tip.style.left = x + 'px'; tip.style.top = (e.clientY + 14) + 'px';
    });
    node.addEventListener('pointerleave', function () { tip.hidden = true; });
  }

  // Horizontal bars. rows: [{label, value, text, highlight, key}]
  function hbars(id, rows, opts) {
    var W = widthOf(id), rowH = 34, L = Math.min(opts.left || 190, Math.round(W * 0.42)), R = 64, top = 8;
    var H = top + rows.length * rowH + 24;
    var max = opts.max || niceMax(Math.max.apply(null, rows.map(function (r) { return r.value; })));
    var x = function (v) { return L + v / max * (W - L - R); };
    var s = svg(W, H, opts.label);
    var ticks = W < 520 ? 2 : 4;
    for (var i = 0; i <= ticks; i++) {
      var v = max * i / ticks, gx = x(v);
      s.appendChild(el('line', { x1: gx, x2: gx, y1: top, y2: H - 22, class: 'grid-line' }));
      s.appendChild(el('text', { x: gx, y: H - 6, 'text-anchor': 'middle', class: 'axis' }, opts.tick ? opts.tick(v) : (v >= 1000 ? v / 1000 + 'k' : fmt.format(v))));
    }
    rows.forEach(function (r, i) {
      var y = top + i * rowH;
      s.appendChild(el('text', { x: L - 10, y: y + rowH / 2 + 4, 'text-anchor': 'end' }, r.label));
      var bar = el('rect', { x: L, y: y + 7, width: Math.max(1, x(r.value) - L), height: rowH - 14, rx: 3, fill: r.highlight ? C.accent : C.rest, class: 'mark' });
      if (r.key) bar.dataset.key = r.key;
      hover(bar, r.label + ': ' + r.text);
      s.appendChild(bar);
      s.appendChild(el('text', { x: x(r.value) + 6, y: y + rowH / 2 + 4, 'font-weight': '700' }, r.short || r.text));
    });
    document.getElementById(id).replaceChildren(s);
  }

  function drawCharts() {
    // ---- Late requests by department ----
    var depts = D.departments.slice().sort(function (a, b) { return b.late_requests - a.late_requests; });
    hbars('c-dept', depts.map(function (d) {
      return { key: d.department, label: d.department === 'OTHER' ? (narrow('c-dept') ? 'All others' : d.department_name) : (narrow('c-dept') || d.department === d.department_name ? d.department : d.department + ' (' + d.department_name + ')'),
        value: d.late_requests, short: fmt.format(d.late_requests), highlight: d.department === 'DOT',
        text: fmt.format(d.late_requests) + ' late of ' + fmt.format(d.closed_requests) + ' closed (' + pct1(d.pct_on_time) + ' on time)' };
    }), { label: 'Late requests by department', left: 280 });

    // ---- On-time rate by month: DOT vs all ----
    (function () {
      var rows = D.monthly_on_time, W = widthOf('c-month'), H = 300, L = 44, R = 16, top = 16, bottom = 28;
      var lo = 80, hi = 100;
      var x = function (i) { return L + i * (W - L - R) / (rows.length - 1); };
      var y = function (v) { return top + (hi - v) / (hi - lo) * (H - top - bottom); };
      var s = svg(W, H, 'On-time rate by month for DOT and all departments');
      [80, 85, 90, 95, 100].forEach(function (v) {
        s.appendChild(el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid-line' }));
        s.appendChild(el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'axis' }, v + '%'));
      });
      rows.forEach(function (r, i) { s.appendChild(el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', class: 'axis' }, narrow('c-month') ? r.month[0] : r.month)); });
      [['county_pct_on_time', C.compare, 'All departments'], ['dot_pct_on_time', C.accent, 'DOT']].forEach(function (series) {
        var d = rows.map(function (r, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(r[series[0]]).toFixed(1); }).join(' ');
        s.appendChild(el('path', { d: d, fill: 'none', stroke: series[1], 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
        rows.forEach(function (r, i) {
          var dot = el('circle', { cx: x(i), cy: y(r[series[0]]), r: 4.5, fill: series[1], stroke: '#fff', 'stroke-width': 2, class: 'mark' });
          hover(dot, series[2] + ', ' + r.month + ': ' + pct1(r[series[0]]) + ' on time');
          s.appendChild(dot);
        });
      });
      var low = rows.reduce(function (a, b) { return b.dot_pct_on_time < a.dot_pct_on_time ? b : a; });
      var li = rows.indexOf(low);
      s.appendChild(el('text', { x: x(li), y: y(low.dot_pct_on_time) + 20, 'text-anchor': 'middle', 'font-weight': '700' }, 'Low: ' + pct1(low.dot_pct_on_time)));
      document.getElementById('c-month').replaceChildren(s);
    })();

    // ---- Requests by month (vertical bars) ----
    (function () {
      var rows = D.monthly_requests, W = widthOf('c-vol'), H = 280, L = 52, R = 8, top = 22, bottom = 28;
      var max = 60000, bw = (W - L - R) / rows.length;
      var y = function (v) { return top + (1 - v / max) * (H - top - bottom); };
      var peak = Math.max.apply(null, rows.map(function (r) { return r.requests; }));
      var s = svg(W, H, 'Requests by month');
      [0, 20000, 40000, 60000].forEach(function (v) {
        s.appendChild(el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid-line' }));
        s.appendChild(el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'axis' }, v / 1000 + 'k'));
      });
      rows.forEach(function (r, i) {
        var bx = L + i * bw + bw * 0.18, isPeak = r.requests === peak;
        var bar = el('rect', { x: bx, y: y(r.requests), width: bw * 0.64, height: y(0) - y(r.requests), rx: 3, fill: isPeak ? C.accent : C.rest, class: 'mark' });
        hover(bar, r.month + ': ' + fmt.format(r.requests) + ' requests');
        s.appendChild(bar);
        s.appendChild(el('text', { x: bx + bw * 0.32, y: H - 8, 'text-anchor': 'middle', class: 'axis' }, narrow('c-vol') ? r.month[0] : r.month));
        if (isPeak) s.appendChild(el('text', { x: bx + bw * 0.32, y: y(r.requests) - 6, 'text-anchor': 'middle', 'font-weight': '700' }, fmt.format(r.requests)));
      });
      document.getElementById('c-vol').replaceChildren(s);
    })();

    // ---- DOT by area ----
    var areas = D.dot_by_area.slice().sort(function (a, b) { return a.pct_on_time - b.pct_on_time; });
    hbars('c-area', areas.map(function (a) {
      return { label: a.area, value: a.pct_on_time, short: pct1(a.pct_on_time), highlight: a.area === 'Tree Maintenance',
        text: pct1(a.pct_on_time) + ' on time, ' + fmt.format(a.late_requests) + ' late of ' + fmt.format(a.closed_requests) };
    }), { label: 'DOT on-time rate by service area', max: 100, left: 150, tick: function (v) { return v + '%'; } });

    // ---- DOT by district ----
    var dist = D.dot_by_district.slice().sort(function (a, b) { return a.council_district - b.council_district; });
    var worst = dist.slice().sort(function (a, b) { return a.pct_on_time - b.pct_on_time; }).slice(0, 3).map(function (d) { return d.council_district; });
    hbars('c-dist', dist.map(function (d) {
      return { label: 'District ' + d.council_district, value: d.pct_on_time, short: pct1(d.pct_on_time), highlight: worst.indexOf(d.council_district) > -1,
        text: pct1(d.pct_on_time) + ' on time across ' + fmt.format(d.closed_requests) + ' closed DOT requests' };
    }), { label: 'DOT on-time rate by council district', max: 100, left: 100, tick: function (v) { return v + '%'; } });

    // ---- Contact source ----
    hbars('c-src', D.contact_source.map(function (r) {
      return { label: r.source, value: r.requests, short: (r.requests / T.requests < 0.005 ? '<1' : Math.round(r.requests / T.requests * 100)) + '%', highlight: r.source === 'Phone',
        text: fmt.format(r.requests) + ' requests (' + (r.requests / T.requests * 100).toFixed(1) + '%)' };
    }), { label: 'How residents contact MC311', left: 110, tick: function (v) { return v / 1000 + 'k'; } });

    // ---- Top requests ----
    hbars('c-top', D.top_requests.map(function (r, i) {
      var max = narrow('c-top') ? 18 : 34;
      var short = r.topic.length > max ? r.topic.slice(0, max - 2) + '…' : r.topic;
      return { label: short, value: r.requests, short: fmt.format(r.requests), highlight: i === 0, text: r.topic + ': ' + fmt.format(r.requests) };
    }), { label: 'Most common request types', left: 250, tick: function (v) { return v / 1000 + 'k'; } });

  }

  // ---- Scorecard table: sortable, click a row to highlight its bar ----
  var tbody = document.querySelector('#scorecard tbody');
  var sortKey = 'pct_on_time', asc = true;
  function renderTable() {
    var rows = D.departments.slice().sort(function (a, b) {
      if (a.department === 'OTHER') return 1;
      if (b.department === 'OTHER') return -1;
      var x = a[sortKey], y = b[sortKey];
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * (asc ? 1 : -1);
    });
    tbody.replaceChildren.apply(tbody, rows.map(function (d) {
      var tr = document.createElement('tr');
      tr.tabIndex = 0;
      tr.dataset.key = d.department;
      tr.setAttribute('aria-selected', 'false');
      var name = d.department === 'OTHER' || d.department === d.department_name ? d.department_name : d.department + ' · ' + d.department_name;
      [name, fmt.format(d.closed_requests), fmt.format(d.late_requests), pct1(d.pct_on_time)].forEach(function (v, i) {
        var td = document.createElement('td'); td.textContent = v; if (i) td.className = 'n'; tr.appendChild(td);
      });
      return tr;
    }));
    document.querySelectorAll('#scorecard th button').forEach(function (b) {
      if (b.dataset.sort === sortKey) b.setAttribute('aria-sort', asc ? 'ascending' : 'descending'); else b.removeAttribute('aria-sort');
    });
  }
  function select(key) {
    tbody.querySelectorAll('tr').forEach(function (tr) {
      var on = tr.dataset.key === key && tr.getAttribute('aria-selected') !== 'true';
      tr.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var chosen = tbody.querySelector('tr[aria-selected="true"]');
    document.querySelectorAll('#c-dept rect.mark').forEach(function (r) {
      r.classList.toggle('faded', !!chosen && r.dataset.key !== chosen.dataset.key);
    });
  }
  document.querySelectorAll('#scorecard th button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (sortKey === b.dataset.sort) asc = !asc; else { sortKey = b.dataset.sort; asc = sortKey === 'department_name' || sortKey === 'pct_on_time'; }
      renderTable();
    });
  });
  tbody.addEventListener('click', function (e) { var tr = e.target.closest('tr'); if (tr) select(tr.dataset.key); });
  tbody.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { var tr = e.target.closest('tr'); if (tr) { e.preventDefault(); select(tr.dataset.key); } }
  });
  renderTable();
  drawCharts();

  // Redraw charts when the layout width changes (rotating a phone, resizing a window)
  var lastWidth = window.innerWidth, timer;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(function () {
      var chosen = tbody.querySelector('tr[aria-selected="true"]');
      drawCharts();
      if (chosen) { chosen.setAttribute('aria-selected', 'false'); select(chosen.dataset.key); }
    }, 150);
  });
})();
