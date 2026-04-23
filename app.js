// =============================================
// DASHBOARD DESLINDE SECTOR 5 - app.js
// Agencia Nacional de Tierras
// =============================================

function estadoBadge(val) {
  if (!val || val === 'None') return '<span class="badge-est bg-gray">—</span>';
  const v = val.toLowerCase();
  let cls = 'bg-gray';
  if (v.includes('exitosa') || v.includes('jornada') || v.includes('efectiva')) cls = 'bg-green';
  else if (v.includes('sin confirmación') || v.includes('sin confirmacion') || v.includes('pagina web') || v.includes('página web')) cls = 'bg-yellow';
  else if (v.includes('devol')) cls = 'bg-red';
  else if (v.includes('citacion') || v.includes('citación') || v.includes('electrónica')) cls = 'bg-blue';
  else if (v.includes('fisico') || v.includes('físico') || v.includes('particular')) cls = 'bg-teal';
  return `<span class="badge-est ${cls}">${val}</span>`;
}

function avBadge(val) {
  if (!val || val === 'No' || val === '') return '<span class="badge-est bg-gray">—</span>';
  const v = val.toLowerCase();
  if (v.includes('web')) return `<span class="badge-est bg-blue">${val}</span>`;
  return `<span class="badge-est bg-teal">${val}</span>`;
}

function renderTable(rows) {
  const tbody = document.getElementById('tableBody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#718096">No se encontraron registros</td></tr>';
    document.getElementById('tableInfo').textContent = 'Mostrando 0 registros';
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="font-weight:600;color:#2E7D32">${r.n}</td>
      <td style="max-width:200px;font-size:.75rem">${r.nombre}</td>
      <td style="white-space:nowrap;font-size:.75rem">${r.doc}</td>
      <td style="font-size:.68rem;color:#718096">${r.fmi}</td>
      <td style="white-space:nowrap;font-size:.75rem">${r.tel}</td>
      <td>${estadoBadge(r.estado_antes)}</td>
      <td>${avBadge(r.aviso)}</td>
      <td>${estadoBadge(r.estado_final)}</td>
    </tr>
  `).join('');
  document.getElementById('tableInfo').textContent =
    `Mostrando ${rows.length} de ${ALL_DATA.length} registros`;
}

function filterData() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const fEstado = document.getElementById('filterEstado').value;
  const fFmi = document.getElementById('filterFmi').value;
  const fAviso = document.getElementById('filterAviso').value;

  let rows = ALL_DATA;
  if (search) rows = rows.filter(r =>
    r.nombre.toLowerCase().includes(search) ||
    r.doc.toLowerCase().includes(search) ||
    r.n.toString().includes(search)
  );
  if (fEstado) rows = rows.filter(r => r.estado_final === fEstado);
  if (fFmi) rows = rows.filter(r => r.fmi_res.toUpperCase() === fFmi);
  if (fAviso) rows = rows.filter(r => r.aviso === fAviso);
  renderTable(rows);
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterEstado').value = '';
  document.getElementById('filterFmi').value = '';
  document.getElementById('filterAviso').value = '';
  renderTable(ALL_DATA);
}

function populateFilters() {
  const sel = document.getElementById('filterEstado');
  const estados = [...new Set(ALL_DATA.map(r => r.estado_final).filter(Boolean))].sort();
  estados.forEach(e => {
    const o = document.createElement('option');
    o.value = e; o.textContent = e;
    sel.appendChild(o);
  });
}

function renderCharts() {
  // Chart 1 — Estado Etapa 1
  const c1 = {};
  ALL_DATA.forEach(r => {
    if (r.estado_antes) c1[r.estado_antes] = (c1[r.estado_antes] || 0) + 1;
  });
  new Chart(document.getElementById('chart1'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(c1),
      datasets: [{
        data: Object.values(c1),
        backgroundColor: ['#48BB78','#F6AD55','#FC8181','#63B3ED','#76E4F7','#9F7AEA','#F687B3','#68D391','#FBD38D','#A0AEC0'],
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, padding: 6, boxWidth: 12 } } }
    }
  });

  // Chart 2 — Estado Final
  const c2 = {};
  ALL_DATA.forEach(r => {
    if (r.estado_final) c2[r.estado_final] = (c2[r.estado_final] || 0) + 1;
  });
  const labels2 = Object.keys(c2).map(k => k.length > 28 ? k.substring(0,28)+'…' : k);
  new Chart(document.getElementById('chart2'), {
    type: 'bar',
    data: {
      labels: labels2,
      datasets: [{
        label: 'Registros',
        data: Object.values(c2),
        backgroundColor: ['#2E7D32','#F9A825','#1565C0','#00838F','#6A1B9A','#AD1457','#E65100'],
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 8 } } },
        y: { beginAtZero: true, ticks: { stepSize: 50 } }
      }
    }
  });
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('updateTime').textContent =
    new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

  populateFilters();
  renderTable(ALL_DATA);
  renderCharts();

  ['searchInput', 'filterEstado', 'filterFmi', 'filterAviso'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', filterData);
    el.addEventListener('change', filterData);
  });
});
