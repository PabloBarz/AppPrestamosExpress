/**
 * modules/dashboard.js
 * Controla la vista public/views/dashboard.html.
 */

'use strict';

const DashboardModule = {

  async init() {
    this._renderStats();
    this._renderRecentModels();
    this._renderModelsByBrand();
    this._bindEvents();
  },

  _renderStats() {
    setText('stat-total-marcas', AppState.marcas.length);
    setText('stat-total-tipos', AppState.tiposHerramienta.length);
    setText('stat-total-modelos', AppState.modelos.length);
    setText('stat-total-herramientas', AppState.herramientas.length);
  },

  _renderRecentModels() {
    const container = document.getElementById('tabla-recientes');
    const recientes = AppState.modelos.slice(0, 6);

    if (!recientes.length) {
      container.innerHTML = `<div class="empty-state"><i class="bi bi-diagram-3"></i><p>No hay modelos registrados</p></div>`;
      return;
    }

    container.innerHTML = `
      <table class="recent-table">
        <tbody>
          ${recientes.map(modelo => `
            <tr>
              <td>
                <div class="cell-producto-name">${escapeHtml(modelo.modelo)}</div>
                <div class="cell-producto-desc">${escapeHtml(modelo.marca)} · ${escapeHtml(modelo.tipo_herramienta)}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  },

  _renderModelsByBrand() {
    const container = document.getElementById('chart-marcas');

    if (!AppState.marcas.length) {
      container.innerHTML = `<div class="empty-state"><i class="bi bi-bookmark-x"></i><p>No hay marcas registradas</p></div>`;
      return;
    }

    const counts = AppState.marcas.map(marca => {
      const total = AppState.modelos.filter(modelo =>
        Number(modelo.id_marca) === Number(marca.id_marca)
      ).length;

      return {
        nombre: marca.nombre,
        total,
      };
    });

    const max = Math.max(...counts.map(item => item.total), 1);

    container.innerHTML = counts.map(item => `
      <div class="chart-bar-item">
        <div class="chart-bar-label">
          <span>${escapeHtml(item.nombre)}</span>
          <span>${item.total}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${(item.total / max) * 100}%"></div>
        </div>
      </div>
    `).join('');
  },

  _bindEvents() {
    document.querySelectorAll('[data-page="modelos"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        Router.navigateTo('modelos');
      });
    });
  },
};
