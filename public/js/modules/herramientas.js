'use strict';

const HerramientasModule = {

  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    const tbody = document.getElementById('bodyHerramientas');

    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <div class="spinner-custom"></div>
        </td>
      </tr>`;

    try {
      const estado = document.getElementById('filterEstado')?.value;
      let url = '/api/herramientas';

      if (estado) {
        url += `?estado=${estado}`;
      }

      const [herrRes, modelosRes] = await Promise.all([
        http(url),
        http('/api/modelos')
      ]);

      AppState.herramientas = herrRes.data;
      AppState.modelos = modelosRes.data;

      this._fillFilters();

      this._render(AppState.herramientas);
      updateBadges();
    } catch (e) {
      showToast('Error al cargar herramientas', 'error');
    }
  },

  _estadoBadge(estado) {
    const map = {
      Disponible: 'badge-success',
      Prestado: 'badge-warning',
      Mantenimiento: 'badge-info',
      Danado: 'badge-danger',
      Perdido: 'badge-dark'
    };

    return `<span class="${map[estado] || 'badge'}">${estado}</span>`;
  },

  _render(lista) {
    const tbody = document.getElementById('bodyHerramientas');

    setText('totalHerramientasLabel', `${lista.length} herramienta(s)`);

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">
            No hay herramientas
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = lista.map((h, i) => `
      <tr>
        <td>${String(i + 1).padStart(2, '0')}</td>
        <td>${escapeHtml(h.codigo)}</td>
        <td>${escapeHtml(h.modelo)}</td>
        <td>${escapeHtml(h.marca)}</td>
        <td>${escapeHtml(h.tipo)}</td>
        <td>${escapeHtml(h.categoria)}</td>
        <td>${this._estadoBadge(h.estado)}</td>

        <td>
          <button class="btn-action"
            onclick="HerramientasModule.openEdit(${h.id_herramienta})">
            <i class="bi bi-pencil-fill"></i>
          </button>

          <button class="btn-action"
            onclick="HerramientasModule.changeEstado(${h.id_herramienta})">
            <i class="bi bi-arrow-repeat"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  _openModal(mode, h = null) {
    const isEdit = mode === 'edit';

    // limpiar siempre
    document.getElementById('hCodigo').value = '';
    document.getElementById('hSerie').value = '';
    document.getElementById('hUbicacion').value = '';
    document.getElementById('hQr').value = '';
    document.getElementById('hModelo').value = '';

    setText('modalHerramientaTitle', isEdit ? 'Editar' : 'Nueva');

    document.getElementById('herramientaId').value = isEdit ? h.id_herramienta : '';
    document.getElementById('hCodigo').value = isEdit ? h.codigo : '';
    document.getElementById('hSerie').value = isEdit ? h.numero_serie : '';
    document.getElementById('hUbicacion').value = isEdit ? h.ubicacion || '' : '';
    document.getElementById('hQr').value = isEdit ? h.codigoqr || '' : '';

    document.getElementById('hModelo').innerHTML =
      AppState.modelos.map(m =>
        `<option value="${m.id_modelo}">${m.modelo}</option>`
      ).join('');

    if (isEdit) {
            // bloquear campos en edición
      document.getElementById('hModelo').disabled = true;
      document.getElementById('hSerie').disabled = true;
      document.getElementById('hModelo').value = h.id_modelo;
    }

    if (!isEdit) {
      document.getElementById('hModelo').disabled = false;
      document.getElementById('hSerie').disabled = false;
    }

    openOverlay('modalHerramientaOverlay');
  },

  openEdit(id) {
    const h = AppState.herramientas.find(x => x.id_herramienta == id);
    if (!h) return showToast('No encontrado', 'error');

    this._openModal('edit', h);
  },

  async _save() {
    const id = document.getElementById('herramientaId').value;

    const payload = {
      id_modelo: Number(document.getElementById('hModelo').value),
      numero_serie: document.getElementById('hSerie').value,
      ubicacion: document.getElementById('hUbicacion').value,
      codigoqr: document.getElementById('hQr').value
    };

    // generar código SOLO si es nuevo
    if (!id) {
      const max = Math.max(
        0,
        ...AppState.herramientas.map(h => Number(h.codigo?.split('-')[1]) || 0)
      );

      const siguiente = String(max + 1).padStart(3, '0');
      payload.codigo = `H-${siguiente}`;
    }


    // validar SOLO en creación
    if (!id) {
      if (!payload.id_modelo) {
        showToast('Selecciona un modelo', 'error');
        return;
      }

      if (!payload.numero_serie) {
        showToast('El número de serie es obligatorio', 'error');
        return;
      }
    }

    setLoading('btnSaveHerramienta', null, null, true);

    try {
      await http(
        id ? `/api/herramientas/${id}` : '/api/herramientas',
        id ? 'PUT' : 'POST',
        payload
      );

      closeOverlay('modalHerramientaOverlay');
      showToast('Guardado correctamente', 'success');
      this.load();

    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnSaveHerramienta', null, null, false);
    }
  },

  changeEstado(id) {
    document.getElementById('estadoHerramientaId').value = id;
    openOverlay('modalEstadoOverlay');
  },

  _filter() {

    const search = document.getElementById('searchHerramienta')
      .value.toLowerCase();

    const estado = document.getElementById('filterEstado').value;

    const categoria = document.getElementById('filterCategoria').value;

    const tipo = document.getElementById('filterTipo').value;

    const marca = document.getElementById('filterMarca').value;

    if (!AppState.herramientas) return;

    const filtered = AppState.herramientas.filter(h => {

      const matchSearch =
        (h.codigo || '').toLowerCase().includes(search) ||
        (h.modelo || '').toLowerCase().includes(search);

      const matchEstado =
        !estado || h.estado === estado;

      const matchCategoria =
        !categoria || h.categoria === categoria;

      const matchTipo =
        !tipo || h.tipo === tipo;

      const matchMarca =
        !marca || h.marca === marca;

      return (
        matchSearch &&
        matchEstado &&
        matchCategoria &&
        matchTipo &&
        matchMarca
      );
    });

    this._render(filtered);
  },

  _fillFilters() {

    const categorias = [
      ...new Set(AppState.herramientas.map(h => h.categoria))
    ];

    const tipos = [
      ...new Set(AppState.herramientas.map(h => h.tipo))
    ];

    const marcas = [
      ...new Set(AppState.herramientas.map(h => h.marca))
    ];

    document.getElementById('filterCategoria').innerHTML = `
      <option value="">Todas las categorías</option>
      ${categorias.map(c =>
        `<option value="${c}">${c}</option>`
      ).join('')}
    `;

    document.getElementById('filterTipo').innerHTML = `
      <option value="">Todos los tipos</option>
      ${tipos.map(t =>
        `<option value="${t}">${t}</option>`
      ).join('')}
    `;

    document.getElementById('filterMarca').innerHTML = `
      <option value="">Todas las marcas</option>
      ${marcas.map(m =>
        `<option value="${m}">${m}</option>`
      ).join('')}
    `;
  },

  _bindEvents() {
    document.getElementById('btnCloseModalHerramienta')
      ?.addEventListener('click', () => closeOverlay('modalHerramientaOverlay'));

    document.getElementById('btnNuevaHerramienta')
      ?.addEventListener('click', () => this._openModal('new'));

    document.getElementById('btnSaveHerramienta')
      ?.addEventListener('click', () => this._save());

    document.getElementById('btnCancelHerramienta')
      ?.addEventListener('click', () => closeOverlay('modalHerramientaOverlay'));

    document.getElementById('btnRefreshHerramientas')
      ?.addEventListener('click', () => this.load());

    document.getElementById('searchHerramienta')
      ?.addEventListener('input', () => this._filter());

    document.getElementById('modalHerramientaOverlay')
      ?.addEventListener('click', (e) => {
        if (e.target.id === 'modalHerramientaOverlay')
          closeOverlay('modalHerramientaOverlay');
    });

    document.getElementById('filterEstado')
    ?.addEventListener('change', () => this._filter());

    document.getElementById('filterCategoria')
    ?.addEventListener('change', () => this._filter());

    document.getElementById('filterTipo')
    ?.addEventListener('change', () => this._filter());

    document.getElementById('filterMarca')
    ?.addEventListener('change', () => this._filter());

    document.getElementById('modalEstadoOverlay')
      ?.addEventListener('click', (e) => {
        if (e.target.id === 'modalEstadoOverlay')
          closeOverlay('modalEstadoOverlay');
    });

    document.getElementById('btnGuardarEstado')
      ?.addEventListener('click', async () => {

        const id = document.getElementById('estadoHerramientaId').value;
        const estado = document.getElementById('nuevoEstado').value;

        try {
            await http(`/api/herramientas/${id}/estado`, 'PATCH', { estado });

            showToast('Estado actualizado', 'success');
            closeOverlay('modalEstadoOverlay');
            this.load();

          } catch (e) {
            showToast(e.message, 'error');
          }
        });
      }

};