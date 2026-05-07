"use strict";

const ComprasModule = {

  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    try {

      const res = await http('/api/compras');

      this.data = res.data;

      this._render();

    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  _render() {

    const tbody = document.getElementById('bodyCompras');

    if (!this.data.length) {

      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4">
            Sin compras registradas
          </td>
        </tr>
      `;

      return;
    }

    tbody.innerHTML = this.data.map((c, i) => `
      <tr>

        <td>${i + 1}</td>

        <td>
          ${c.razon_social}
        </td>

        <td>
          ${c.tipo_comprobante} - ${c.numero_comprobante}
        </td>

        <td>
          ${new Date(c.fecha_compra).toLocaleDateString()}
        </td>

        <td>
          S/ ${parseFloat(c.total).toFixed(2)}
        </td>

        <td>
          ${c.user_name}
        </td>

        <td>
          ${this._badgeEstado(c.estado)}
        </td>

        <td>
          <button class="btn-sm btn-primary">
            Ver
          </button>
        </td>

      </tr>
    `).join('');
  },

  _badgeEstado(estado) {

    const map = {
      Registrado: 'badge bg-success',
      Anulado: 'badge bg-danger'
    };

    return `
      <span class="${map[estado] || 'badge bg-secondary'}">
        ${estado}
      </span>
    `;
  },

  _bindEvents() {

    document.getElementById('btnRefreshCompras')
      ?.addEventListener('click', () => this.load());

    document.getElementById('btnNuevaCompra')
      ?.addEventListener('click', () => {

        showToast(
          'Registro de compras próximamente',
          'info'
        );

      });
  }

};