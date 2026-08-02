import api from "./api";

export async function fetchSemesters() {
  const res = await api.get("/api/semesters", {
    params: {
      sort: "start_date:desc",
    },
  });

  return res.data.data;
}

export async function updateSemesterImpactLives(documentId, impactedLives) {
  return api.put(`/api/semesters/${documentId}/impact-lives`, {
    data: {
      impacted_lives: Number(impactedLives) || 0,
    },
  });
}
