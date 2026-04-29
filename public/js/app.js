/**
 * app.js
 * Punto de arranque de la SPA.
 */

'use strict';

const AppState = {
  marcas: [],
  modelos: [],
  tiposHerramienta: [],
  deleteTarget: { type: null, id: null, name: null, onConfirm: null },
};

const DeleteModal = {

  render() {
    document.getElementById('modalsContainer').innerHTML = `
      <div class="modal-overlay" id="modalDeleteOverlay">
        <div class="modal-panel modal-sm">
          <div class="modal-header-custom">
            <div class="modal-title-custom text-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar eliminacion
            </div>
            <button class="btn-modal-close" id="btnCloseDelete"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body-custom">
            <p class="text-muted mb-0" id="deleteMessage">
              ¿Estas seguro de que deseas eliminar este registro?
            </p>
          </div>
          <div class="modal-footer-custom">
            <button class="btn-cancel" id="btnCancelDelete">Cancelar</button>
            <button class="btn-danger-action" id="btnConfirmDelete">
              <i class="bi bi-trash3-fill me-1"></i> Eliminar
            </button>
          </div>
        </div>
      </div>`;

    document.getElementById('btnConfirmDelete').addEventListener('click', () => this._execute());
    document.getElementById('btnCancelDelete').addEventListener('click', () => closeOverlay('modalDeleteOverlay'));
    document.getElementById('btnCloseDelete').addEventListener('click', () => closeOverlay('modalDeleteOverlay'));
    document.getElementById('modalDeleteOverlay').addEventListener('click', e => {
      if (e.target.id === 'modalDeleteOverlay') closeOverlay('modalDeleteOverlay');
    });
  },

  open(type, id, name, onConfirm) {
    AppState.deleteTarget = { type, id, name, onConfirm };

    const msgs = {
      marca: `¿Eliminar la marca "<strong>${escapeHtml(name)}</strong>"? Solo se puede si no tiene modelos asociados.`,
      modelo: `¿Eliminar el modelo "<strong>${escapeHtml(name)}</strong>"? Solo se puede si no esta asociado a otros registros.`,
      tipoHerramienta: `¿Eliminar el tipo "<strong>${escapeHtml(name)}</strong>"? Solo se puede si no tiene modelos asociados.`,
    };

    document.getElementById('deleteMessage').innerHTML = msgs[type] || '¿Confirmar eliminacion?';
    openOverlay('modalDeleteOverlay');
  },

  async _execute() {
    const { onConfirm } = AppState.deleteTarget;
    closeOverlay('modalDeleteOverlay');
    if (typeof onConfirm === 'function') await onConfirm();
  },
};

function updateBadges() {
  setText('badge-marcas', AppState.marcas.length);
  setText('badge-tipos-herramienta', AppState.tiposHerramienta.length);
}

document.addEventListener('DOMContentLoaded', () => {
  DeleteModal.render();
  Router.init();
  Router.navigateTo('dashboard');
});
