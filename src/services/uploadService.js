import api from "./api";

/**
 * Faz upload no Strapi usando /api/upload
 * Retorna o primeiro arquivo do array
 */
export async function uploadRepositoryFile({ file, description }) {
  const formData = new FormData();
  formData.append("files", file);

  // opcional: infos extras do arquivo dentro do Media Library
  formData.append(
    "fileInfo",
    JSON.stringify({
      caption: description,
      alternativeText: description,
    })
  );

  const jwt = localStorage.getItem("jwt");

  const res = await api.post("/api/upload", formData, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      // NÃO definir Content-Type aqui
    },
  });

  return res.data[0]; // Strapi retorna array
}

export async function deleteRepositoryFile(fileId) {
  const jwt = localStorage.getItem("jwt");

  await api.delete(`/api/upload/files/${fileId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}
