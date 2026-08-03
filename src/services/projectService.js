import api from "./api";

function mapRelationItem(item) {
  if (!item) return null;

  const base = item.attributes || item;
  return {
    id: item.documentId || item.id,
    documentId: item.documentId || item.id,
    ...base,
  };
}

export const projectService = {
  async getProjectOccupancy() {
    const res = await api.get("/api/projects/occupancy");
    return res.data?.data || [];
  },

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
        title: base.name || "(sem nome)",
        content:
          base.description || "Projeto sem descrição cadastrada no momento.",
        institutionId,
        institutionName,
        institutionSlug,
        status: base.is_active === false ? "inativo" : "ativo",
      };
    });
  },

  async getProjectMetrics(documentId) {
    const res = await api.get(`/api/projects/${encodeURIComponent(documentId)}/metrics`);
    const item = res.data?.data;
    if (!item) return null;

    return {
      id: item.documentId || item.id,
      documentId: item.documentId || item.id,
      name: item.name || "(sem nome)",
      slug: item.slug,
      isActive: item.isActive !== false,
      users: item.users || [],
      leader: item.leader || null,
      semesters: item.semesters || [],
      maxStudents: item.maxStudents ?? 0,
    };
  },

  async setProjectLeader(documentId, leaderUserId) {
    return api.put(`/api/projects/${documentId}/leader`, {
      data: {
        leaderUserId,
      },
    });
  },
};
