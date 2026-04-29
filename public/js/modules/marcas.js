/**
 * modules/marcas.js
 * Controla la vista public/views/marcas.html.
 */

"use strict";

const MarcasModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById("bodyMarcas").innerHTML =
      `<tr><td colspan="5" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;

    try {
      const [marcasRes, modelosRes] = await Promise.all([
        http("/api/marcas"),
        http("/api/modelos"),
      ]);

      AppState.marcas = marcasRes.data;
      AppState.modelos = modelosRes.data;

      this._render(AppState.marcas);
      updateBadges();
    } catch (e) {
      showToast("Error al cargar marcas: " + e.message, "error");
    }
  },

  _render(lista) {
    setText("totalMarcasLabel", `${lista.length} marca(s) registrada(s)`);
    const tbody = document.getElementById("bodyMarcas");

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
        <i class="bi bi-bookmark-x"></i><p>No hay marcas registradas</p>
      </div></td></tr>`;
      return;
    }

    tbody.innerHTML = lista
      .map((marca, i) => {
        const totalModelos = AppState.modelos.filter(
          (modelo) => Number(modelo.id_marca) === Number(marca.id_marca),
        ).length;

        return `
        <tr>
          <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i + 1).padStart(2, "0")}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="width:32px;height:32px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--primary)">
                <i class="bi bi-bookmark-star-fill"></i>
              </div>
              <span class="fw-600">${escapeHtml(marca.nombre)}</span>
            </div>
          </td>
          <td>${escapeHtml(marca.descripcion) || '<span class="text-muted">Sin descripcion</span>'}</td>
          <td><span class="badge-garantia">${totalModelos} modelo${totalModelos !== 1 ? "s" : ""}</span></td>
          <td>
            <button class="btn-action"
              onclick="Router.navigateTo('modelos', { id_marca: ${marca.id_marca}, nombre: '${escapeHtml(marca.nombre)}' })"
              title="Ver modelos">
              <i class="bi bi-eye-fill"></i>
            </button>

            <button class="btn-action btn-action-edit"
              onclick="MarcasModule.openEdit(${marca.id_marca})"
              title="Editar">
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button class="btn-action btn-action-delete"
              onclick="MarcasModule.confirmDel(${marca.id_marca}, '${escapeHtml(marca.nombre)}')"
              title="Eliminar">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </td>
        </tr>`;
      })
      .join("");
  },

  _filter() {
    const search =
      document.getElementById("searchMarca")?.value.toLowerCase() || "";

    this._render(
      AppState.marcas.filter(
        (marca) =>
          marca.nombre.toLowerCase().includes(search) ||
          (marca.descripcion || "").toLowerCase().includes(search),
      ),
    );
  },

  _openModal(mode, marca = null) {
    const isEdit = mode === "edit";

    setText("modalMarcaTitle", isEdit ? "Editar Marca" : "Nueva Marca");
    document.getElementById("marcaId").value = isEdit ? marca.id_marca : "";
    document.getElementById("mNombre").value = isEdit ? marca.nombre : "";
    document.getElementById("mDescripcion").value = isEdit
      ? marca.descripcion || ""
      : "";
    clearErrors(["mNombre"]);
    openOverlay("modalMarcaOverlay");
  },

  openEdit(id) {
    const marca = AppState.marcas.find(
      (m) => Number(m.id_marca) === Number(id),
    );
    if (!marca) return showToast("Marca no encontrada", "error");

    this._openModal("edit", marca);
  },

  confirmDel(id, name) {
    DeleteModal.open("marca", id, name, async () => {
      try {
        await http(`/api/marcas/${id}`, "DELETE");
        showToast(`"${name}" eliminada correctamente`, "success");
        await this.load();
      } catch (e) {
        showToast(e.message, "error");
      }
    });
  },

  async _save() {
    const id = document.getElementById("marcaId").value;
    const nombre = document.getElementById("mNombre").value.trim();
    const descripcion = document.getElementById("mDescripcion").value.trim();

    clearErrors(["mNombre"]);

    if (!nombre) {
      setError("mNombre", "err-mNombre", "El nombre de la marca es requerido");
      return;
    }

    const isEdit = !!id;
    const payload = {
      nombre,
      descripcion: descripcion || null,
    };

    setLoading("btnSaveMarca", "btnSaveMarcaText", "btnSaveMarcaSpinner", true);

    try {
      await http(
        isEdit ? `/api/marcas/${id}` : "/api/marcas",
        isEdit ? "PUT" : "POST",
        payload,
      );
      showToast(
        `Marca ${isEdit ? "actualizada" : "creada"} correctamente`,
        "success",
      );
      closeOverlay("modalMarcaOverlay");
      await this.load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(
        "btnSaveMarca",
        "btnSaveMarcaText",
        "btnSaveMarcaSpinner",
        false,
      );
    }
  },

  _bindEvents() {
    document
      .getElementById("btnNuevaMarca")
      ?.addEventListener("click", () => this._openModal("new"));
    document
      .getElementById("btnSaveMarca")
      ?.addEventListener("click", () => this._save());
    document
      .getElementById("btnCancelMarca")
      ?.addEventListener("click", () => closeOverlay("modalMarcaOverlay"));
    document
      .getElementById("btnCloseModalMarca")
      ?.addEventListener("click", () => closeOverlay("modalMarcaOverlay"));
    document
      .getElementById("btnRefreshMarcas")
      ?.addEventListener("click", () => this.load());
    document
      .getElementById("searchMarca")
      ?.addEventListener("input", () => this._filter());
    document
      .getElementById("modalMarcaOverlay")
      ?.addEventListener("click", (e) => {
        if (e.target.id === "modalMarcaOverlay")
          closeOverlay("modalMarcaOverlay");
      });
  },
};
