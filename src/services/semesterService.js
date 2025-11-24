import api from "./api";

export async function fetchSemesters() {
  const res = await api.get("/api/semesters", {
    params: {
      sort: "start_date:desc",
    },
  });

  return res.data.data;
}
