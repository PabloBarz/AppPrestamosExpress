/**
 * modules/tipo-herramientas.js
 * Controla la vista public/views/tipo-herramientas.html.
 */

'use strict';

const TipoHerramientasModule = {

  async init() {
    this._bindEvents();
    this.params = Router.currentParams || {};
    await this.load();
  },

  async load() {

    if (this.params?.nombre) {
      setText("topbarTitle", `Tipos - ${this.params.nombre}`);
    }

    document.getElementById('bodyTiposHerramienta').innerHTML =
      `<tr><td colspan="6" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;

    try {
      const [tiposRes, modelosRes, categoriasRes] = await Promise.all([
        http('/api/tipo-herramientas'),
        http('/api/modelos'),
        http('/api/categorias'),
      ]);

      AppState.tiposHerramienta = tiposRes.data;
      AppState.modelos = modelosRes.data;
      AppState.categorias = categoriasRes.data;

      let lista = AppState.tiposHerramienta;

      // FILTRO POR CATEGORIA
      if (this.params?.id_categoria) {
        lista = lista.filter(
          t => Number(t.id_categoria) === Number(this.params.id_categoria)
        );
      }

      this._render(lista);
      updateBadges();
    } catch (e) {
      showToast('Error al cargar tipos de herramienta: ' + e.message, 'error');
    }
  },

  _render(lista) {
    setText('totalTiposHerramientaLabel', `${lista.length} tipo(s) registrado(s)`);
    const tbody = document.getElementById('bodyTiposHerramienta');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
        <i class="bi bi-tools"></i><p>No hay tipos de herramienta registrados</p>
      </div></td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((tipoHerramienta, i) => {
      const totalModelos = AppState.modelos.filter(modelo =>
        Number(modelo.id_tipo_herramienta) === Number(tipoHerramienta.id_tipo_herramienta)
      ).length;

      const categoria = AppState.categorias.find(
        c => Number(c.id_categoria) === Number(tipoHerramienta.id_categoria)
      );

      return `
        <tr>
          <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i + 1).padStart(2, '0')}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="width:32px;height:32px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--primary)">
                <i class="bi bi-tools"></i>
              </div>
              <span class="fw-600">${escapeHtml(tipoHerramienta.tipo)}</span>
            </div>
          </td>
          <td>
            ${categoria ? escapeHtml(categoria.nombre) : '-'}
          </td>
          <td>${escapeHtml(tipoHerramienta.descripcion) || '<span class="text-muted">Sin descripcion</span>'}</td>
          <td><span class="badge-garantia">${totalModelos} modelo${totalModelos !== 1 ? 's' : ''}</span></td>
          <td>
            <button class="btn-action"
              onclick="Router.navigateTo('modelos', { id_tipo: ${tipoHerramienta.id_tipo_herramienta}, nombre: '${escapeHtml(tipoHerramienta.tipo)}' })"
              title="Ver modelos">
              <i class="bi bi-eye-fill"></i>
            </button>

            <button class="btn-action btn-action-edit"
              onclick="TipoHerramientasModule.openEdit(${tipoHerramienta.id_tipo_herramienta})"
              title="Editar">
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button class="btn-action btn-action-delete"
              onclick="TipoHerramientasModule.confirmDel(${tipoHerramienta.id_tipo_herramienta}, '${escapeHtml(tipoHerramienta.tipo)}')"
              title="Eliminar">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </td>
        </tr>`;
    }).join('');
  },

  _filter() {
    const search = document.getElementById('searchTipoHerramienta')?.value.toLowerCase() || '';

    let lista = AppState.tiposHerramienta;

    if (this.params?.id_categoria) {
      lista = lista.filter(
        t => Number(t.id_categoria) === Number(this.params.id_categoria)
      );
    }

    this._render(
      lista.filter(tipoHerramienta =>
        tipoHerramienta.tipo.toLowerCase().includes(search) ||
        (tipoHerramienta.descripcion || '').toLowerCase().includes(search)
      )
    );
  },

  _openModal(mode, tipoHerramienta = null) {

    const isEdit = mode === 'edit';

    const select = document.getElementById('thCategoria');

    select.innerHTML = AppState.categorias.map(c => `
      <option value="${c.id_categoria}">
        ${escapeHtml(c.nombre)}
      </option>
    `).join('');

    if (isEdit) {
      select.value = tipoHerramienta.id_categoria;
    }
    
    setText('modalTipoHerramientaTitle', isEdit ? 'Editar Tipo' : 'Nuevo Tipo');
    document.getElementById('tipoHerramientaId').value = isEdit ? tipoHerramienta.id_tipo_herramienta : '';
    document.getElementById('thTipo').value = isEdit ? tipoHerramienta.tipo : '';
    document.getElementById('thDescripcion').value = isEdit ? (tipoHerramienta.descripcion || '') : '';
    clearErrors(['thTipo', 'thCategoria']);
    openOverlay('modalTipoHerramientaOverlay');
  },

  openEdit(id) {
    const tipoHerramienta = AppState.tiposHerramienta.find(t =>
      Number(t.id_tipo_herramienta) === Number(id)
    );

    if (!tipoHerramienta) return showToast('Tipo de herramienta no encontrado', 'error');

    this._openModal('edit', tipoHerramienta);
  },

  confirmDel(id, name) {
    DeleteModal.open('tipoHerramienta', id, name, async () => {
      try {
        await http(`/api/tipo-herramientas/${id}`, 'DELETE');
        showToast(`"${name}" eliminado correctamente`, 'success');
        await this.load();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  },

  async _save() {
    const id = document.getElementById('tipoHerramientaId').value;
    const tipo = document.getElementById('thTipo').value.trim();
    const descripcion = document.getElementById('thDescripcion').value.trim();
    const id_categoria = document.getElementById('thCategoria').value;

    clearErrors(['thTipo', 'thCategoria']);

    if (!tipo || !id_categoria) {
      setError('thTipo', 'err-thTipo', 'Tipo requerido');
      setError('thCategoria', 'err-thCategoria', 'Categoría requerida');
      return;
    }

    const isEdit = !!id;

    const payload = {
      tipo,
      descripcion: descripcion || null,
      id_categoria
    };

    setLoading(
      'btnSaveTipoHerramienta',
      'btnSaveTipoHerramientaText',
      'btnSaveTipoHerramientaSpinner',
      true
    );

    try {
      await http(isEdit ? `/api/tipo-herramientas/${id}` : '/api/tipo-herramientas', isEdit ? 'PUT' : 'POST', payload);
      showToast(`Tipo ${isEdit ? 'actualizado' : 'creado'} correctamente`, 'success');
      closeOverlay('modalTipoHerramientaOverlay');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(
        'btnSaveTipoHerramienta',
        'btnSaveTipoHerramientaText',
        'btnSaveTipoHerramientaSpinner',
        false
      );
    }
  },

  _bindEvents() {
    document.getElementById('btnNuevoTipoHerramienta')?.addEventListener('click', () => this._openModal('new'));
    document.getElementById('btnSaveTipoHerramienta')?.addEventListener('click', () => this._save());
    document.getElementById('btnCancelTipoHerramienta')?.addEventListener('click', () => closeOverlay('modalTipoHerramientaOverlay'));
    document.getElementById('btnCloseModalTipoHerramienta')?.addEventListener('click', () => closeOverlay('modalTipoHerramientaOverlay'));
    document.getElementById('btnRefreshTiposHerramienta')?.addEventListener('click', () => this.load());
    document.getElementById('searchTipoHerramienta')?.addEventListener('input', () => this._filter());
    document.getElementById('modalTipoHerramientaOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalTipoHerramientaOverlay') closeOverlay('modalTipoHerramientaOverlay');
    });
  },
};
