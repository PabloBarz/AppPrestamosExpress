"use strict";

const ComprasModule = {

  async init() {
    this._bindEvents();
    await this.load();
  },

  detalle: [],

  async load() {

    

    try {

      const [compras, proveedores, modelos] = await Promise.all([
        http('/api/compras'),
        http('/api/proveedores'),
        http('/api/modelos')
        ]);

        this.data = compras.data;

        AppState.proveedores = proveedores.data;
        AppState.modelos = modelos.data;

        this._render();
        this._fillSelects();

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

  _fillSelects() {

    const prov = document.getElementById('cProveedor');

    prov.innerHTML = AppState.proveedores.map(p => `
        <option value="${p.id_proveedor}">
        ${p.razon_social}
        </option>
    `).join('');

    const modelos = document.getElementById('dModelo');

    modelos.innerHTML = AppState.modelos.map(m => `
        <option value="${m.id_modelo}">
        ${m.modelo} - ${m.tipo_herramienta} - ${m.marca}
        </option>
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

        this.detalle = [];

        this.renderDetalle();

        document.getElementById('cFecha').value =
            new Date().toISOString().split('T')[0];

        openOverlay('modalCompra');

        });

    document.getElementById('btnAddDetalle')
        ?.addEventListener('click', () => this.addDetalle());

    document.getElementById('btnSaveCompra')
        ?.addEventListener('click', () => this.save());

    },

    addDetalle() {

        const id_modelo =
            document.getElementById('dModelo').value;

        const modeloText =
            document.getElementById('dModelo')
            .selectedOptions[0].text;

        const cantidad =
            parseInt(document.getElementById('dCantidad').value);

        const precio =
            parseFloat(document.getElementById('dPrecio').value);

        if (!cantidad || !precio) {
            return showToast(
            'Complete cantidad y precio',
            'warning'
            );
        }

        this.detalle.push({
            id_modelo,
            modelo: modeloText,
            cantidad,
            precio,
            subtotal: cantidad * precio
        });

        this.renderDetalle();

    },

    renderDetalle() {

        const tbody =
            document.getElementById('bodyDetalleCompra');

        if (!this.detalle.length) {

            tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                Sin detalles
                </td>
            </tr>
            `;

            document.getElementById('totalCompra')
            .textContent = 'S/ 0.00';

            return;
        }

        tbody.innerHTML = this.detalle.map((d, i) => `
            <tr>

            <td>${d.modelo}</td>

            <td>${d.cantidad}</td>

            <td>S/ ${d.precio.toFixed(2)}</td>

            <td>S/ ${d.subtotal.toFixed(2)}</td>

            <td>
                <button
                class="btn-sm btn-danger"
                onclick="ComprasModule.removeDetalle(${i})"
                >
                X
                </button>
            </td>

            </tr>
        `).join('');

        const total = this.detalle
            .reduce((acc, d) => acc + d.subtotal, 0);

        document.getElementById('totalCompra')
            .textContent = `S/ ${total.toFixed(2)}`;

    },

    removeDetalle(index) {

        this.detalle.splice(index, 1);

        this.renderDetalle();

    },

    async save() {

        if (!this.detalle.length) {
            return showToast(
            'Agregue detalles',
            'warning'
            );
        }

        try {

            const data = {
            id_proveedor:
                document.getElementById('cProveedor').value,

            fecha_compra:
                document.getElementById('cFecha').value,

            tipo_comprobante:
                document.getElementById('cTipo').value,

            numero_comprobante:
                document.getElementById('cNumero').value,

            detalles: this.detalle
            };

            await http(
            '/api/compras',
            'POST',
            data
            );

            showToast(
            'Compra registrada',
            'success'
            );

            closeOverlay('modalCompra');

            await this.load();

        } catch (e) {

            showToast(e.message, 'error');

        }

    },

};