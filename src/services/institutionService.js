import api from "./api";

export const institutionService = {
  async getAllInstitutionsSummary() {
    const res = await api.get(
      "/api/institutions?sort[0]=name:asc&fields[0]=name"
    );

    const list = res.data?.data || [];
    return list.map((item) => {
      const base = item.attributes || item;
      const docId = item.documentId || item.id;

      return {
        id: docId,
        name: base.name || "(sem nome)",
      };
    });
  },

  async getInstitutionsPaginated(page = 1, pageSize = 10) {
    const res = await api.get(
      `/api/institutions?populate=logo&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=name:asc`
    );

    const list = res.data?.data || [];
    const meta = res.data?.meta || {};

    const formatted = list.map((item) => {
      const base = item.attributes || item;
      const docId = item.documentId || item.id;

      // Extract image URL (Strapi v4/v5 format variation)
      const logoData = base.logo?.data?.attributes || base.logo?.attributes || base.logo || null;
      let logoUrl = logoData?.url || null;

      // Se a imagem não tiver a baseURL absoluta (ocorre rodando no localhost sem config custom), injetar a baseurl
      if (logoUrl && logoUrl.startsWith("/")) {
        const fullBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:1337";
        logoUrl = fullBaseUrl + logoUrl;
      }

      return {
        id: docId,
        name: base.name || "(sem nome)",
        slug: base.slug || docId,
        description: base.description || "",
        logo: logoUrl,
      };
    });

    return {
      data: formatted,
      meta, // { pagination: { page, pageSize, pageCount, total } }
    };
  },
};
