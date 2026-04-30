"use strict";

const ProveedoresModule = {
  async init() {
    this.bindEvents();
    await this.load();
  },

  async load() {
    setText("totalProveedoresLabel", "Cargando...");

    const estado =
      document.getElementById("filterEstadoProveedor")?.value || "Activo";

    try {
      const res = await http(`/api/proveedores?estado=${estado}`);
      this.data = res.data;
      this.render();

      AppState.proveedores = this.data;
      updateBadges();
    } catch (e) {
      showToast("Error al cargar proveedores", "error");
    }
  },

  bindEvents() {
    document
      .getElementById("btnNuevoProveedor")
      ?.addEventListener("click", () => this.openModal());

    document
      .getElementById("btnCloseModalProveedor")
      ?.addEventListener("click", () => closeOverlay("modalProveedorOverlay"));

    document
      .getElementById("btnCancelProveedor")
      ?.addEventListener("click", () => closeOverlay("modalProveedorOverlay"));

    document
      .getElementById("btnSaveProveedor")
      ?.addEventListener("click", () => this.save());

    document
      .getElementById("filterEstadoProveedor")
      ?.addEventListener("change", async (e) => {
        await this.load();
      });

    document
      .getElementById("searchProveedor")
      ?.addEventListener("input", (e) => this.render(e.target.value));
  },

  render(search = "") {
    const body = document.getElementById("bodyProveedores");

    const filtered = this.data.filter(
      (p) =>
        p.razon_social.toLowerCase().includes(search.toLowerCase()) ||
        p.ruc.includes(search),
    );

    if (filtered.length === 0) {
      body.innerHTML = `<tr><td colspan="7" class="text-center py-4">Sin resultados</td></tr>`;
      setText("totalProveedoresLabel", "0 proveedor(es)");
      return;
    }

    body.innerHTML = filtered
      .map(
        (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.razon_social}</td>
        <td>${p.ruc}</td>
        <td>${p.telefono || "-"}</td>
        <td>${p.email || "-"}</td>
        <td>
          <span class="badge ${p.estado === "Activo" ? "badge-success" : "badge-danger"}">
            ${p.estado}
          </span>
        </td>
        <td>
        ${
          p.estado === "Activo"
            ? `
                <button class="btn-action btn-action-edit"
                onclick="ProveedoresModule.edit(${p.id_proveedor})">
                <i class="bi bi-pencil-fill"></i>
                </button>

                <button class="btn-action btn-action-delete"
                onclick="ProveedoresModule.toggle(${p.id_proveedor}, '${p.estado}', \`${p.razon_social}\`)">
                <i class="bi bi-person-x-fill"></i>
                </button>
            `
            : `
                <button class="btn-action btn-action-success"
                onclick="ProveedoresModule.toggle(${p.id_proveedor}, '${p.estado}', \`${p.razon_social}\`)">
                <i class="bi bi-person-check-fill"></i>
                </button>
            `
        }
        </td>
      </tr>
    `,
      )
      .join("");

    setText("totalProveedoresLabel", `${filtered.length} proveedor(es)`);
  },

  openModal(p = null) {
    clearErrors(["pRazon", "pRuc", "pEmail"]);

    document.getElementById("modalProveedorTitle").textContent = p
      ? "Editar proveedor"
      : "Nuevo proveedor";

    document.getElementById("proveedorId").value = p?.id_proveedor || "";
    document.getElementById("pRazon").value = p?.razon_social || "";
    document.getElementById("pRuc").value = p?.ruc || "";
    document.getElementById("pTelefono").value = p?.telefono || "";
    document.getElementById("pDireccion").value = p?.direccion || "";
    document.getElementById("pEmail").value = p?.email || "";

    openOverlay("modalProveedorOverlay");
  },

  edit(id) {
    const p = this.data.find((x) => x.id_proveedor === id);
    this.openModal(p);
  },

  async save() {
    clearErrors(["pRazon", "pRuc", "pEmail"]);

    const id = document.getElementById("proveedorId").value;

    const data = {
      razon_social: document.getElementById("pRazon").value,
      ruc: document.getElementById("pRuc").value,
      telefono: document.getElementById("pTelefono").value,
      direccion: document.getElementById("pDireccion").value,
      email: document.getElementById("pEmail").value,
    };

    if (!data.razon_social)
      return setError("pRazon", "err-pRazon", "Requerido");
    if (!data.ruc) return setError("pRuc", "err-pRuc", "Requerido");

    try {
      setLoading(
        "btnSaveProveedor",
        "btnSaveProveedorText",
        "btnSaveProveedorSpinner",
        true,
      );

      if (id) {
        await http(`/api/proveedores/${id}`, "PUT", data);
        showToast("Proveedor actualizado");
      } else {
        await http("/api/proveedores", "POST", data);
        showToast("Proveedor creado");
      }

      closeOverlay("modalProveedorOverlay");
      await this.load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(
        "btnSaveProveedor",
        "btnSaveProveedorText",
        "btnSaveProveedorSpinner",
        false,
      );
    }
  },

  toggle(id, estado, nombre) {
    DeleteModal.open(
      "proveedor",
      id,
      nombre,
      async () => {
        await http(`/api/proveedores/${id}/estado`, "PUT", {
          estado: estado === "Activo" ? "Inactivo" : "Activo",
        });

        showToast("Estado actualizado");
        this.load();
      },
      estado,
    );
  },
};
