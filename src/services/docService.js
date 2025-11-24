import api from "./api";

export async function createDoc({
  title,
  description,
  fileId,
  semesterId,
  is_public = true,
}) {
  const jwt = localStorage.getItem("jwt");

  const res = await api.post(
    "/api/docs",
    {
      data: {
        title,
        description,
        is_public,
        file: fileId,
        semester: semesterId,
      },
    },
    {
      headers: { Authorization: `Bearer ${jwt}` },
    }
  );

  return res.data.data;
}

export async function fetchDocs({ semesterId } = {}) {
  const params = {
    populate: {
      file: true,
      semester: true,
    },
    sort: "createdAt:desc",
  };

  if (semesterId) {
    params.filters = {
      semester: { id: { $eq: semesterId } },
    };
  }

  const res = await api.get("/api/docs", { params });
  return res.data.data;
}
