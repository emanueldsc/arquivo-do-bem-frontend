import api from "./api";

export const projectService = {
  async getLatestProjects() {
    const res = await api.get(
      "/api/projects?sort[0]=createdAt:desc&populate[institution][fields][0]=name&populate[institution][fields][1]=slug"
    );

    const list = res.data?.data || [];
    return list.map((item) => {
      const base = item.attributes || item;
      const docId = item.documentId || item.id;

      const instData = base.institution || null;
      let institutionName = "";
      let institutionId = "";
      let institutionSlug = "";
      if (instData) {
        institutionName = instData.name || "(sem instituição)";
        institutionId = instData?.documentId || instData?.id || "";
        institutionSlug = instData?.slug || "";
      }

      return {
        id: docId,
        slug: base.slug,
        title: base.name || "(sem nome)", // título do card
        content:
          base.description || "Projeto sem descrição cadastrada no momento.",
        institutionId,
        institutionName,
        institutionSlug,
        status: base.is_active === false ? "inativo" : "ativo",
      };
    });
  },
};
