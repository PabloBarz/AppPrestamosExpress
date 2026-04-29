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
      `<tr><td colspan="4" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;

    try {
      const params = Router.currentParams || {};
      let url = '/api/modelos';

      //  FILTRO POR MARCA
      if (params.id_marca) {
        url += `?id_marca=${params.id_marca}`;
        setText('tituloModelos', `Modelos de ${params.nombre}`);
        setText('subtituloModelos', 'Modelos asociados a esta marca');
      }

      //  FILTRO POR TIPO
      if (params.id_tipo) {
        url += `?id_tipo=${params.id_tipo}`;
        setText('tituloModelos', `Modelos tipo ${params.nombre}`);
        setText('subtituloModelos', 'Modelos asociados a este tipo');
      }

      const res = await http(url);

      this.data = res.data;

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
          <td colspan="4">
            <div class="empty-state">
              <i class="bi bi-diagram-3"></i>
              <p>No hay modelos registrados</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = lista.map((m, i) => `
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
      </tr>
    `).join('');
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
  }

};