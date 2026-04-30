"use strict";

const UsuariosModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    setText("totalUsuariosLabel", "Cargando...");

    try {
      const estado = document.getElementById("filterEstado")?.value || "Activo";

      const res = await http(`/api/usuarios?estado=${estado}`);
      this.data = res.data;
      this._render(this.data);

      
        AppState.usuarios = this.data;
        updateBadges();
      
    } catch (e) {
      showToast("Error al cargar usuarios", "error");
    }
  },

  _render(lista) {
    const tbody = document.getElementById("bodyUsuarios");

    setText("totalUsuariosLabel", `${lista.length} usuario(s)`);

    if (!lista.length) {
      tbody.innerHTML = `
        <tr><td colspan="6">
          <div class="empty-state">
            <i class="bi bi-people"></i>
            <p>No hay usuarios</p>
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = lista
      .map(
        (u, i) => `
      <tr>
        <td>
          <span style="font-family:'DM Mono';font-size:12px;color:var(--text-muted)">
            ${String(i + 1).padStart(2, "0")}
          </span>
        </td>

        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-xs">
              <i class="bi bi-person-fill"></i>
            </div>
            <span class="fw-600">
              ${escapeHtml(u.nombre)} ${escapeHtml(u.apellidos)}
            </span>
          </div>
        </td>

        <td>${escapeHtml(u.user_name)}</td>

        <td>
          <span class="badge-marca">${escapeHtml(u.rol)}</span>
        </td>

        <td>
          <span class="${u.estado === "Activo" ? "badge-success" : "badge-danger"}">
            ${u.estado}
          </span>
        </td>

        <td>
          ${
            u.estado === "Activo"
              ? `
                <button class="btn-action btn-action-edit"
                  onclick='UsuariosModule._openModalEdit(${JSON.stringify(u)})'>
                  <i class="bi bi-pencil-fill"></i>
                </button> 

                <button class="btn-action btn-action-delete"
                  onclick="UsuariosModule._confirmToggle(${u.id_usuario}, '${u.estado}', \`${u.nombre}\`)">
                  <i class="bi bi-person-x-fill"></i>
                </button>
              `
              : `
                <button class="btn-action btn-action-success"
                  onclick="UsuariosModule._confirmToggle(${u.id_usuario}, '${u.estado}', \`${u.nombre}\`)">
                  <i class="bi bi-person-check-fill"></i>
                </button>
              `
          }
        </td>
      </tr>
    `,
      )
      .join("");
  },

  _bindEvents() {
    document
      .getElementById("btnNuevoUsuario")
      ?.addEventListener("click", () => this._openModal());

    document
      .getElementById("searchUsuario")
      ?.addEventListener("input", () => this._filter());

    document
      .getElementById("filterEstado")
      ?.addEventListener("change", () => this.load());

    // 🔥 MODAL EVENTS
    document
      .getElementById("btnCloseModalUsuario")
      ?.addEventListener("click", () => closeOverlay("modalUsuarioOverlay"));

    document
      .getElementById("btnCancelUsuario")
      ?.addEventListener("click", () => closeOverlay("modalUsuarioOverlay"));

    document
      .getElementById("btnSaveUsuario")
      ?.addEventListener("click", () => this._save());
  },

  _filter() {
    const val = document.getElementById("searchUsuario").value.toLowerCase();

    const filtered = this.data.filter(
      (u) =>
        `${u.nombre} ${u.apellidos}`.toLowerCase().includes(val) ||
        u.user_name.toLowerCase().includes(val),
    );

    this._render(filtered);
  },

  // 🔥 ABRIR MODAL CREAR
  _openModal() {
    document.getElementById("modalUsuarioTitle").textContent = "Nuevo Usuario";
    document.getElementById("formUsuario").reset();
    document.getElementById("usuarioId").value = "";

    document.getElementById("passwordGroup").style.display = "block";

    openOverlay("modalUsuarioOverlay");
  },

  // 🔥 EDITAR
  _openModalEdit(u) {
    document.getElementById("modalUsuarioTitle").textContent = "Editar Usuario";

    document.getElementById("usuarioId").value = u.id_usuario;
    document.getElementById("uNombre").value = u.nombre;
    document.getElementById("uApellidos").value = u.apellidos;
    document.getElementById("uUser").value = u.user_name;
    document.getElementById("uRol").value = u.id_rol;

    document.getElementById("passwordGroup").style.display = "none";

    openOverlay("modalUsuarioOverlay");
  },

  // 🔥 GUARDAR
  async _save() {
    const id = document.getElementById("usuarioId").value;

    try {
      if (id) {
        // EDITAR
        await http(`/api/usuarios/${id}`, "PUT", {
          nombre: uNombre.value,
          apellidos: uApellidos.value,
          user_name: uUser.value,
          id_rol: uRol.value,
        });

        showToast("Usuario actualizado");
      } else {
        // CREAR
        await http("/api/usuarios", "POST", {
          tipodoc: "DNI",
          doc: uDoc.value,
          nombre: uNombre.value,
          apellidos: uApellidos.value,
          telefono: uTelefono.value || null,
          fecha_nac: uFecha.value || null,
          user_name: uUser.value,
          contrasena: uPass.value,
          id_rol: uRol.value,
        });

        showToast("Usuario creado");
      }

      closeOverlay("modalUsuarioOverlay");
      this.load();
    } catch (e) {
      showToast(e.message, "error");
    }
  },

  //  ACTIVAR / DESACTIVAR
  _confirmToggle(id, estado, nombre) {
    DeleteModal.open(
      "usuario",
      id,
      nombre,
      async () => {
        await http(`/api/usuarios/${id}/estado`, "PUT", {
          estado: estado === "Activo" ? "Inactivo" : "Activo",
        });

        showToast("Estado actualizado");
        this.load();
      },
      estado,
    );
  },
};
