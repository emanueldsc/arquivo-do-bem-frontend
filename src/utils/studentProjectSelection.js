function getDocumentId(value) {
  if (!value) return "";
  return String(value.documentId || value.id || value);
}

function getCreatedAt(value) {
  return value?.createdAt || value?.attributes?.createdAt || value?.publishedAt || "";
}

export function getActiveProject(projects = [], selectedProjectId = "") {
  if (!Array.isArray(projects) || projects.length === 0) return null;

  if (selectedProjectId) {
    const selected = projects.find((project) => getDocumentId(project) === String(selectedProjectId));
    if (selected) return selected;
  }

  return [...projects].sort((a, b) => {
    const aTime = new Date(getCreatedAt(a)).getTime();
    const bTime = new Date(getCreatedAt(b)).getTime();

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return bTime - aTime;
  })[0] || null;
}

export function isProjectEditable(project, activeProject) {
  if (!project || !activeProject) return false;
  return getDocumentId(project) === getDocumentId(activeProject);
}

export function canAssociateToProject(linkedProjects = [], currentSemester = null) {
  if (!currentSemester) return true;
  return !Array.isArray(linkedProjects) || linkedProjects.length === 0;
}

export function buildProjectOccupancyMap(items = []) {
  const occupancy = {};

  const normalizedItems = Array.isArray(items) ? items : [];

  normalizedItems.forEach((item) => {
    const projectId = getDocumentId(item);

    const base = item?.attributes || item || {};
    const projectRelations = item?.projects || base.projects || [];
    const projectList = Array.isArray(projectRelations) ? projectRelations : projectRelations?.data || [];

    if (projectList.length > 0) {
      projectList.forEach((project) => {
        const relationId = getDocumentId(project);
        if (!relationId) return;
        occupancy[relationId] = (occupancy[relationId] || 0) + 1;
      });
      return;
    }

    if (!projectId) return;

    const users = item?.users || base.users || [];
    const userList = Array.isArray(users) ? users : users?.data || [];

    if (userList.length > 0) {
      occupancy[projectId] = userList.length;
    }
  });

  return occupancy;
}
