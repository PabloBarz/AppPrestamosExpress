"use strict";

const PrestamosHistorialModule = {

  async init() {
    this._bindEvents();
    this._fillColaboradores();
    await this.load();
  },

  async load() {
    try {
      const params = new URLSearchParams();

      const desde = document.getElementById("fDesde").value;
      const hasta = document.getElementById("fHasta").value;
      const colab = document.getElementById("fColaborador").value;

      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (colab) params.append("colaborador", colab);

      const res = await http(`/api/prestamos/historial?${params}`);

      this.data = res.data;

      this._render();

    } catch (e) {
      showToast(e.message, "error");
    }
  },

  _render() {
    const tbody = document.getElementById("bodyHistorial");

    if (!this.data.length) {
      tbody.innerHTML = `<tr><td colspan="7">Sin historial</td></tr>`;
      return;
    }

    tbody.innerHTML = this.data.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.nombre} ${p.apellidos}</td>
        <td>${new Date(p.fecha_prestamo).toLocaleString()}</td>
        <td>${new Date(p.fecha_devolucion).toLocaleString()}</td>
        <td>${p.total_herramientas}</td>
        <td>${this._badgeEstado(p.estado)}</td>
        <td>
          <button onclick="PrestamosHistorialModule.ver(${p.id_prestamo})">
            Ver
          </button>
        </td>
      </tr>
    `).join('');
  },

  _badgeEstado(estado) {
    const map = {
      Finalizado: 'badge bg-secondary',
      Vencido: 'badge bg-danger'
    };

    return `<span class="${map[estado] || 'badge bg-secondary'}">${estado}</span>`;
  },

  _fillColaboradores() {
    const sel = document.getElementById("fColaborador");

    sel.innerHTML = `
      <option value="">Todos</option>
      ${AppState.colaboradores.map(c =>
        `<option value="${c.id_colaborador}">
          ${c.nombre} ${c.apellidos}
        </option>`
      ).join('')}
    `;
  },

  _bindEvents() {
    document.getElementById("btnFiltrarHistorial")
      .addEventListener("click", () => this.load());

    document.getElementById("btnRefreshHistorial")
      .addEventListener("click", () => this.load());
  },
  async ver(id) {
    try {
      const res = await http(`/api/prestamos/${id}`);

      const tbody = document.getElementById("detallePrestamoBody");
      if (!tbody) return;

      tbody.innerHTML = res.data.map(d => `
        <tr>
          <td>${d.codigo}</td>

          <td>${new Date(d.hora_prestamo).toLocaleString()}</td>

          <td>${new Date(d.hora_devolucion_esperada).toLocaleTimeString()}</td>

          <td>
            ${d.hora_devolucion_final 
              ? new Date(d.hora_devolucion_final).toLocaleTimeString()
              : '<span class="text-muted">—</span>'
            }
          </td>

          <td>${this._badgeEstado(d.estado || 'Devuelto')}</td>

          <td>
            ${d.estado_devolucion || '<span class="text-muted">—</span>'}
          </td>

          <td>
            ${d.observaciones_devolucion || '<span class="text-muted">—</span>'}
          </td>

          <td>
            ${d.usuario_devolucion 
              ? `<span class="badge bg-info">${d.usuario_devolucion}</span>`
              : '<span class="text-muted">—</span>'
            }
          </td>

          <td>
            <span class="text-muted">✔</span>
          </td>
        </tr>
      `).join('');

      openOverlay("modalDetallePrestamo");

    } catch (e) {
      showToast(e.message, "error");
    }
  }

};