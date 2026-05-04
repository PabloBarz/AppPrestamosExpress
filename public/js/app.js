/**
 * app.js
 * Punto de arranque de la SPA.
 */

"use strict";

const AppState = {
  marcas: [],
  modelos: [],
  tiposHerramienta: [],
  categorias: [],
  usuarios: [],
  proveedores: [],
  deleteTarget: { type: null, id: null, name: null, onConfirm: null },
};

const DeleteModal = {
  render() {
    document.getElementById("modalsContainer").innerHTML = `
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
              <span id="btnConfirmDeleteText">
                <i class="bi bi-trash3-fill me-1"></i> Eliminar
              </span>
            </button>
          </div>
        </div>
      </div>`;

    document
      .getElementById("btnConfirmDelete")
      .addEventListener("click", () => this._execute());
    document
      .getElementById("btnCancelDelete")
      .addEventListener("click", () => closeOverlay("modalDeleteOverlay"));
    document
      .getElementById("btnCloseDelete")
      .addEventListener("click", () => closeOverlay("modalDeleteOverlay"));
    document
      .getElementById("modalDeleteOverlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "modalDeleteOverlay")
          closeOverlay("modalDeleteOverlay");
      });
  },

  open(type, id, name, onConfirm, estado = null) {
    AppState.deleteTarget = { type, id, name, onConfirm, estado };

    const btnText = document.getElementById("btnConfirmDeleteText");

    let message = "¿Confirmar acción?";

    if (type === "usuario") {
      const isActivo = String(estado).trim().toLowerCase() === "activo";

      //  TEXTO BOTÓN
      btnText.innerHTML = isActivo
        ? `<i class="bi bi-person-x-fill me-1"></i> Eliminar`
        : `<i class="bi bi-person-check-fill me-1"></i> Reactivar`;

      //  MENSAJE
      message = `¿Deseas ${
        isActivo ? "eliminar" : "reactivar"
      } al usuario "<strong>${escapeHtml(name)}</strong>"?`;
    
    } else if (type === "proveedor") {
      const isActivo = String(estado).trim().toLowerCase() === "activo";

      btnText.innerHTML = isActivo
        ? `<i class="bi bi-trash-fill me-1"></i> Eliminar`
        : `<i class="bi bi-arrow-clockwise me-1"></i> Reactivar`;

      message = `¿Deseas ${
        isActivo ? "eliminar" : "reactivar"
      } al proveedor "<strong>${escapeHtml(name)}</strong>"?`;
    } else {
      const msgs = {
        marca: `¿Eliminar la marca "<strong>${escapeHtml(name)}</strong>"?`,
        modelo: `¿Eliminar el modelo "<strong>${escapeHtml(name)}</strong>"?`,
        tipoHerramienta: `¿Eliminar el tipo "<strong>${escapeHtml(name)}</strong>"?`,
        categoria: `¿Eliminar la categoría "<strong>${escapeHtml(name)}</strong>"?`,
      };

      message = msgs[type] || message;

      // reset botón default
      btnText.innerHTML = `<i class="bi bi-trash3-fill me-1"></i> Eliminar`;
    }

    document.getElementById("deleteMessage").innerHTML = message;

    openOverlay("modalDeleteOverlay");
  },

  async _execute() {
    const { onConfirm } = AppState.deleteTarget;
    closeOverlay("modalDeleteOverlay");
    if (typeof onConfirm === "function") await onConfirm();
  },
};

function updateBadges() {
  setText("badge-marcas", AppState.marcas.length);
  setText("badge-tipos-herramienta", AppState.tiposHerramienta.length);
  setText("badge-modelos", AppState.modelos.length);
  setText("badge-usuarios", AppState.usuarios.length);
  setText("badge-proveedores", AppState.proveedores.length);
  setText("badge-categorias", AppState.categorias.length);
}

async function loadCatalogData() {
  try {
    const [marcasRes, tiposRes, modelosRes, usuariosRes, proveedoresRes, categoriasRes] =
      await Promise.all([
        http("/api/marcas"),
        http("/api/tipo-herramientas"),
        http("/api/modelos"),
        http("/api/usuarios?estado=Activo"),
        http("/api/proveedores?estado=Activo"),
        http("/api/categorias"),
      ]);

    AppState.marcas = marcasRes.data;
    AppState.tiposHerramienta = tiposRes.data;
    AppState.modelos = modelosRes.data;
    AppState.usuarios = usuariosRes.data;
    AppState.proveedores = proveedoresRes.data;
    AppState.categorias = categoriasRes.data;
    updateBadges();
  } catch (e) {
    showToast("Error al cargar datos iniciales: " + e.message, "error");
  }
}

document.addEventListener("click", (e) => {
  //  LOGOUT
  if (e.target.closest("#btnLogout")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    Router.navigateTo("login");
  }

  //  DROPDOWN USUARIO
  const btn = document.getElementById("userMenuBtn");
  const dropdown = document.getElementById("userDropdown");

  if (!btn || !dropdown) return;

  if (btn.contains(e.target)) {
    dropdown.classList.toggle("open");
  } else {
    dropdown.classList.remove("open");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  DeleteModal.render();
  Router.init();
  await loadCatalogData();

  const token = localStorage.getItem("token");
  if (token) {
    Router.navigateTo("dashboard");
  } else {
    Router.navigateTo("login");
  }
});
