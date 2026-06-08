"use strict";

const PrestamosModule = {

  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    try {
      const [prestamos, colaboradores, herramientas] = await Promise.all([
        http('/api/prestamos/activos'),
        http('/api/colaboradores'),
        http('/api/herramientas')
      ]);


      this.data = prestamos.data;
      AppState.colaboradores = colaboradores.data;
      AppState.herramientas = herramientas.data;

      this._render();
      this._fillSelects();

    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  _render() {
    const tbody = document.getElementById('bodyPrestamos');

    if (!this.data.length) {
      tbody.innerHTML = `<tr><td colspan="5">Sin datos</td></tr>`;
      return;
    }

    tbody.innerHTML = this.data.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.nombre} ${p.apellidos}</td>
        <td>${new Date(p.fecha_prestamo).toLocaleString()}</td>
        <td>${p.total_herramientas}</td>
        <td>${this._badgeEstado(p.estado)}</td>
        <td>
          <button onclick="PrestamosModule.ver(${p.id_prestamo})">Ver</button>
        </td>
      </tr>
    `).join('');
  },
  _badgeEstado(estado) {
    const map = {
      Activo: 'badge-success',
      Finalizado: 'badge-secondary',
      Vencido: 'badge-danger',
      Devuelto: 'badge bg-success',
      Prestado: 'badge bg-warning text-dark',
    };

    return `<span class="badge ${map[estado] || 'badge-secondary'}">${estado}</span>`;
  },

  

  _fillSelects() {
    // colaboradores
    const colSel = document.getElementById('pColaborador');
    colSel.innerHTML = AppState.colaboradores.map(c =>
      `<option value="${c.id_colaborador}">${c.nombre} ${c.apellidos}</option>`
    ).join('');

    // herramientas disponibles
    const herramientas = AppState.herramientas.filter(h => h.estado === 'Disponible');

    const hSel = document.getElementById('pHerramientas');
    hSel.innerHTML = herramientas.map(h =>
      `
      <option value="${h.id_herramienta}">
        ${h.codigo} - ${h.modelo} - ${h.tipo} - ${h.marca}
      </option>
      `
    ).join('');
  },

  async save() {
    const id_colaborador = document.getElementById('pColaborador').value;

    const herramientas = [...document.getElementById('pHerramientas').selectedOptions]
      .map(o => parseInt(o.value));

    const observacion = document.getElementById('pObservacion').value;

    if (!herramientas.length) {
      return showToast('Seleccione herramientas', 'warning');
    }

    try {
      await http(
        '/api/prestamos',
        'POST',
        {
            id_colaborador,
            herramientas,
            observacion
        }
      );

      showToast('Préstamo creado', 'success');
      closeOverlay('modalPrestamoOverlay');
      document.getElementById('pObservacion').value = '';
      [...document.getElementById('pHerramientas').options].forEach(o => o.selected = false);
      await this.load();
      if (typeof updateBadges === "function") {
        updateBadges();
      }

    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  _bindEvents() {
    document.getElementById('btnNuevoPrestamo')
      .addEventListener('click', () => openOverlay('modalPrestamoOverlay'));

    document.getElementById('btnCancelPrestamo')
      .addEventListener('click', () => closeOverlay('modalPrestamoOverlay'));

    document.getElementById('btnClosePrestamo')
      .addEventListener('click', () => closeOverlay('modalPrestamoOverlay'));

    document.getElementById('btnSavePrestamo')
      .addEventListener('click', () => this.save());

    document.getElementById('btnRefreshPrestamos')
      .addEventListener('click', () => this.load());

    document.getElementById('btnConfirmDevolucion')
    .addEventListener('click', () => this.confirmDevolucion());
  },

  async ver(id) {
    try {
      const res = await http(`/api/prestamos/${id}`);

      const tbody = document.getElementById("detallePrestamoBody");

      tbody.innerHTML = res.data.map(d => `
        <tr>
          <td>${d.codigo}</td>

          <td>${new Date(d.hora_prestamo).toLocaleString()}</td>

          <td>${new Date(d.hora_devolucion_esperada).toLocaleTimeString()}</td>

          <td>
            ${d.hora_devolucion_final 
              ? new Date(d.hora_devolucion_final).toLocaleTimeString()
              : '<span class="text-muted">Pendiente</span>'
            }
          </td>

          <td>${this._badgeEstado(d.estado)}</td>

          <td>
            ${d.estado_devolucion || '<span class="text-muted">—</span>'}
          </td>

          <td>
            ${
              d.estado === 'Prestado'
                ? `<button class="btn-sm btn-success"
                    onclick="PrestamosModule.openDevolver(${d.id_detalle_prestamo})">
                    Devolver
                  </button>`
                : '<span class="text-muted">—</span>'
            }
          </td>
        </tr>
      `).join('');

      openOverlay("modalDetallePrestamo");

    } catch (e) {
      showToast(e.message, "error");
    }
  },

  async confirmDevolucion() {
    const id = document.getElementById('devolverDetalleId').value;
    const estado = document.getElementById('estadoDevolucion').value;
    const obs = document.getElementById('obsDevolucion').value;

    try {
      await http(
        `/api/prestamos/devolver/${id}`,
        'PATCH',
        {
          estado_devolucion: estado,
          observaciones_devolucion: obs
        }
      );

      showToast('Herramienta devuelta correctamente', 'success');

      closeOverlay('modalDevolver');
      closeOverlay('modalDetallePrestamo');

      await this.load();

    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  openDevolver(id) {
    document.getElementById('devolverDetalleId').value = id;
    document.getElementById('estadoDevolucion').value = 'Bueno';
    document.getElementById('obsDevolucion').value = '';

    openOverlay('modalDevolver');
  }

};