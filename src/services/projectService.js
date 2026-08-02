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
    const res = await api.get(
      `/api/projects?filters[documentId][$eq]=${encodeURIComponent(documentId)}&populate[users][fields][0]=username&populate[users][fields][1]=email&populate[leader][fields][0]=username&populate[leader][fields][1]=email&populate[semesters][fields][0]=name&populate[semesters][fields][1]=year&populate[semesters][fields][2]=impacted_lives`
    );

    const item = res.data?.data?.[0];
    if (!item) return null;

    const base = item.attributes || item;
    const users = (base.users?.data || base.users || [])
      .map(mapRelationItem)
      .filter(Boolean);
    const semesters = (base.semesters?.data || base.semesters || [])
      .map(mapRelationItem)
      .filter(Boolean);
    const leader = mapRelationItem(base.leader?.data || base.leader);

    return {
      id: item.documentId || item.id,
      documentId: item.documentId || item.id,
      name: base.name || "(sem nome)",
      slug: base.slug,
      isActive: base.is_active !== false,
      users,
      leader,
      semesters,
      maxStudents: base.max_students ?? 0,
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
