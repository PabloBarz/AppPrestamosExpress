/**
 * modules/modelos.js
 * Controla la vista public/views/modelos.html
 */

'use strict';

const ModelosModule = {

  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyModelos').innerHTML =
      `<tr><td colspan="6" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;

    try {
      const params = Router.currentParams || {};
      let url = '/api/modelos';

      let query = [];

      if (params.id_marca) {
        query.push(`id_marca=${params.id_marca}`);
        setText('tituloModelos', `Modelos de ${params.nombre}`);
        setText('subtituloModelos', 'Modelos asociados a esta marca');
      }

      if (params.id_tipo) {
        query.push(`id_tipo=${params.id_tipo}`);
        setText('tituloModelos', `Modelos tipo ${params.nombre}`);
        setText('subtituloModelos', 'Modelos asociados a este tipo');
      }

      if (query.length) {
        url += `?${query.join('&')}`;
      }

      const [modelosRes, marcasRes, tiposRes, categoriasRes] = await Promise.all([
        http(url),
        http('/api/marcas'),
        http('/api/tipo-herramientas'),
        http('/api/categorias'),
      ]);

      this.data = modelosRes.data;
      AppState.marcas = marcasRes.data;
      AppState.tiposHerramienta = tiposRes.data;
      AppState.categorias = categoriasRes.data;

      this._render(this.data);

    } catch (e) {
      showToast('Error al cargar modelos: ' + e.message, 'error');
    }
  },

  _render(lista) {
    const tbody = document.getElementById('bodyModelos');

    setText('totalModelosLabel', `${lista.length} modelo(s)`);

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="bi bi-diagram-3"></i>
              <p>No hay modelos registrados</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = lista.map((m, i) => {
      const tipo = AppState.tiposHerramienta.find(
      t => Number(t.id_tipo_herramienta) === Number(m.id_tipo_herramienta))
      

      const categoria = tipo
        ? AppState.categorias.find(c => Number(c.id_categoria) === Number(tipo.id_categoria))
        : null;
      return `
        <tr>
          <td>
            <span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">
              ${String(i + 1).padStart(2, '0')}
            </span>
          </td>

          <td>
            <div class="cell-producto-name">${escapeHtml(m.modelo)}</div>
          </td>

          <td>
            <span class="badge-marca">${escapeHtml(m.marca)}</span>
          </td>

          <td>${escapeHtml(m.tipo_herramienta)}</td>

          <td>
            ${categoria ? escapeHtml(categoria.nombre) : '-'}
          </td>

          <td>
            <button class="btn-action btn-action-edit"
              onclick="ModelosModule.openEdit(${m.id_modelo})"
              title="Editar">
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button class="btn-action btn-action-delete"
              onclick="ModelosModule.confirmDel(${m.id_modelo}, '${escapeHtml(m.modelo)}')"
              title="Eliminar">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </td>
        </tr>
      `}).join('');
    
  },

  _filter() {
    const search = document.getElementById('searchModelo')?.value.toLowerCase() || '';

    const filtered = this.data.filter(m =>
      m.modelo.toLowerCase().includes(search) ||
      m.marca.toLowerCase().includes(search) ||
      m.tipo_herramienta.toLowerCase().includes(search)
    );

    this._render(filtered);
  },

  _bindEvents() {
    document.getElementById('btnRefreshModelos')
      ?.addEventListener('click', () => this.load());

    document.getElementById('searchModelo')
      ?.addEventListener('input', () => this._filter());

    document.getElementById('btnNuevoModelo')
    ?.addEventListener('click', () => this._openModal('new'));

    document.getElementById('btnSaveModelo')
      ?.addEventListener('click', () => this._save());

    document.getElementById('btnCancelModelo')
      ?.addEventListener('click', () => closeOverlay('modalModeloOverlay'));

    document.getElementById('btnCloseModalModelo')
      ?.addEventListener('click', () => closeOverlay('modalModeloOverlay'));

    document.getElementById('modalModeloOverlay')
      ?.addEventListener('click', (e) => {
        if (e.target.id === 'modalModeloOverlay') {
          closeOverlay('modalModeloOverlay');
        }
      });
  },

  _openModal(mode, modelo = null) {
  const isEdit = mode === 'edit';

  if (!isEdit) {
    document.getElementById('mModelo').value = '';
  }

  setText('modalModeloTitle', isEdit ? 'Editar Modelo' : 'Nuevo Modelo');

  document.getElementById('modeloId').value = isEdit ? modelo.id_modelo : '';
  document.getElementById('mModelo').value = isEdit ? modelo.modelo : '';

  // llenar selects
  document.getElementById('mMarca').innerHTML =
    AppState.marcas.map(m =>
      `<option value="${m.id_marca}">${escapeHtml(m.nombre)}</option>`
    ).join('');

  document.getElementById('mTipo').innerHTML =
    AppState.tiposHerramienta.map(t =>
      `<option value="${t.id_tipo_herramienta}">${escapeHtml(t.tipo)}</option>`
    ).join('');

  if (isEdit) {
    document.getElementById('mMarca').value = modelo.id_marca;
    document.getElementById('mTipo').value = modelo.id_tipo_herramienta;
  }

  openOverlay('modalModeloOverlay');
},

openEdit(id) {
  const modelo = this.data.find(m => Number(m.id_modelo) === Number(id));
  if (!modelo) return showToast('Modelo no encontrado', 'error');

  this._openModal('edit', modelo);
},

confirmDel(id, name) {
  DeleteModal.open('modelo', id, name, async () => {
    try {
      await http(`/api/modelos/${id}`, 'DELETE');
      showToast(`"${name}" eliminado correctamente`, 'success');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  });
},

async _save() {
  const id = document.getElementById('modeloId').value;
  const modelo = document.getElementById('mModelo').value.trim();
  const id_marca = document.getElementById('mMarca').value;
  const id_tipo_herramienta = document.getElementById('mTipo').value;

  if (!modelo || !id_marca || !id_tipo_herramienta) {
    showToast('Todos los campos son obligatorios', 'error');
    return;
  }

  const isEdit = !!id;

  try {
    await http(
      isEdit ? `/api/modelos/${id}` : '/api/modelos',
      isEdit ? 'PUT' : 'POST',
      { modelo, id_marca, id_tipo_herramienta }
    );

    showToast(`Modelo ${isEdit ? 'actualizado' : 'creado'} correctamente`, 'success');
    closeOverlay('modalModeloOverlay');
    document.getElementById('searchModelo').value = '';
    await this.load();

  } catch (e) {
    showToast(e.message, 'error');
  }
},

};