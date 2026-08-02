import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProjectOccupancyMap, canAssociateToProject, getActiveProject, isProjectEditable } from './studentProjectSelection.js';

test('seleciona o projeto mais recente quando nenhum projeto é explicitamente escolhido', () => {
  const projects = [
    { id: 1, documentId: 'doc-1', name: 'Primeiro', createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 2, documentId: 'doc-2', name: 'Segundo', createdAt: '2024-02-01T00:00:00.000Z' },
  ];

  const active = getActiveProject(projects);

  assert.equal(active.documentId, 'doc-2');
});

test('marca como editável apenas o projeto ativo atual', () => {
  const projects = [
    { id: 1, documentId: 'doc-1', name: 'Primeiro', createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 2, documentId: 'doc-2', name: 'Segundo', createdAt: '2024-02-01T00:00:00.000Z' },
  ];

  const active = getActiveProject(projects, 'doc-1');

  assert.equal(active.documentId, 'doc-1');
  assert.equal(isProjectEditable(projects[0], active), true);
  assert.equal(isProjectEditable(projects[1], active), false);
});

test('conta corretamente os alunos vinculados a cada projeto pelo relacionamento do usuário', () => {
  const users = [
    {
      projects: [
        { documentId: 'proj-1' },
        { documentId: 'proj-2' },
      ],
    },
    {
      projects: [{ documentId: 'proj-1' }],
    },
  ];

  const occupancy = buildProjectOccupancyMap(users);

  assert.deepEqual(occupancy, {
    'proj-1': 2,
    'proj-2': 1,
  });
});

test('bloqueia nova associação quando já existe vínculo no semestre atual', () => {
  assert.equal(canAssociateToProject([{ documentId: 'proj-1' }], { documentId: 'sem-1' }), false);
  assert.equal(canAssociateToProject([], { documentId: 'sem-1' }), true);
  assert.equal(canAssociateToProject([{ documentId: 'proj-1' }], null), true);
});
