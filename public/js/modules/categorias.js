"use strict";

const CategoriasModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    const tbody = document.getElementById("bodyCategorias");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5">
            <div class="spinner-custom"></div>
          </td>
        </tr>`;
    }

    try {
      const [categoriasRes, tiposRes] = await Promise.all([
        http("/api/categorias"),
        http("/api/tipo-herramientas"),
      ]);

      AppState.categorias = categoriasRes.data || [];
      AppState.tiposHerramienta = tiposRes.data || [];

      this._render(AppState.categorias);
      updateBadges();
    } catch (e) {
      showToast("Error al cargar categorías: " + e.message, "error");
    }
  },

  _render(lista) {
    setText(
      "totalCategoriasLabel",
      `${lista.length} categoria(s) registrada(s)`
    );

    const tbody = document.getElementById("bodyCategorias");

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <i class="bi bi-tags"></i>
              <p>No hay categorías registradas</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = lista
      .map((cat, i) => {
        const totalTipos = AppState.tiposHerramienta.filter(
          (t) => Number(t.id_categoria) === Number(cat.id_categoria)
        ).length;

        return `
        <tr>
          <td>
            <span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">
              ${String(i + 1).padStart(2, "0")}
            </span>
          </td>

          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="width:32px;height:32px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--primary)">
                <i class="bi bi-tags-fill"></i>
              </div>
              <span class="fw-600">${escapeHtml(cat.nombre)}</span>
            </div>
          </td>

          <td>
            ${
              cat.descripcion
                ? escapeHtml(cat.descripcion)
                : '<span class="text-muted">Sin descripción</span>'
            }
          </td>

          <td>
            <span class="badge-garantia">
              ${totalTipos} tipo${totalTipos !== 1 ? "s" : ""}
            </span>
          </td>

          <td>
            <button class="btn-action"
              onclick="Router.navigateTo('tipoHerramientas', { id_categoria: ${cat.id_categoria}, nombre: '${escapeHtml(
          cat.nombre
        )}' })"
              title="Ver tipos">
              <i class="bi bi-eye-fill"></i>
            </button>

            <button class="btn-action btn-action-edit"
              onclick="CategoriasModule.openEdit(${cat.id_categoria})"
              title="Editar">
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button class="btn-action btn-action-delete"
              onclick="CategoriasModule.confirmDel(${cat.id_categoria}, '${escapeHtml(
          cat.nombre
        )}')"
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
      document.getElementById("searchCategoria")?.value.toLowerCase() || "";

    const filtrado = AppState.categorias.filter(
      (c) =>
        c.nombre.toLowerCase().includes(search) ||
        (c.descripcion || "").toLowerCase().includes(search)
    );

    this._render(filtrado);
  },

  _openModal(mode, cat = null) {
    const isEdit = mode === "edit";

    setText(
      "modalCategoriaTitle",
      isEdit ? "Editar Categoría" : "Nueva Categoría"
    );

    document.getElementById("categoriaId").value = isEdit
      ? cat.id_categoria
      : "";
    document.getElementById("cNombre").value = isEdit ? cat.nombre : "";
    document.getElementById("cDescripcion").value = isEdit
      ? cat.descripcion || ""
      : "";

    clearErrors(["cNombre"]);
    openOverlay("modalCategoriaOverlay");
  },

  openEdit(id) {
    const cat = AppState.categorias.find(
      (c) => Number(c.id_categoria) === Number(id)
    );

    if (!cat) {
      showToast("Categoría no encontrada", "error");
      return;
    }

    this._openModal("edit", cat);
  },

  confirmDel(id, name) {
    DeleteModal.open("categoria", id, name, async () => {
      try {
        await http(`/api/categorias/${id}`, "DELETE");
        showToast(`"${name}" eliminada correctamente`, "success");
        await this.load();
      } catch (e) {
        showToast(e.message, "error");
      }
    });
  },

  async _save() {
    const id = document.getElementById("categoriaId").value;
    const nombre = document.getElementById("cNombre").value.trim();
    const descripcion = document
      .getElementById("cDescripcion")
      .value.trim();

    clearErrors(["cNombre"]);

    if (!nombre) {
      setError("cNombre", "err-cNombre", "El nombre es requerido");
      return;
    }

    const isEdit = !!id;

    setLoading(
      "btnSaveCategoria",
      "btnSaveCategoriaText",
      "btnSaveCategoriaSpinner",
      true
    );

    try {
      await http(
        isEdit ? `/api/categorias/${id}` : "/api/categorias",
        isEdit ? "PUT" : "POST",
        {
          nombre,
          descripcion: descripcion || null,
        }
      );

      showToast(
        `Categoría ${isEdit ? "actualizada" : "creada"} correctamente`,
        "success"
      );

      closeOverlay("modalCategoriaOverlay");
      await this.load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(
        "btnSaveCategoria",
        "btnSaveCategoriaText",
        "btnSaveCategoriaSpinner",
        false
      );
    }
  },

  _bindEvents() {
    document
      .getElementById("btnNuevaCategoria")
      ?.addEventListener("click", () => this._openModal("new"));

    document
      .getElementById("btnSaveCategoria")
      ?.addEventListener("click", () => this._save());

    document
      .getElementById("btnCancelCategoria")
      ?.addEventListener("click", () =>
        closeOverlay("modalCategoriaOverlay")
      );

    document
      .getElementById("btnCloseModalCategoria")
      ?.addEventListener("click", () =>
        closeOverlay("modalCategoriaOverlay")
      );

    document
      .getElementById("btnRefreshCategorias")
      ?.addEventListener("click", () => this.load());

    document
      .getElementById("searchCategoria")
      ?.addEventListener("input", () => this._filter());

    document
      .getElementById("modalCategoriaOverlay")
      ?.addEventListener("click", (e) => {
        if (e.target.id === "modalCategoriaOverlay") {
          closeOverlay("modalCategoriaOverlay");
        }
      });
  },
};