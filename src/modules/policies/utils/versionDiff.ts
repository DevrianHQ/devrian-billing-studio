import { Clause } from '../types';

export interface ClauseDiffItem {
  key: string;
  numberB: number;
  numberA?: number;
  titleB: string;
  titleA?: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  changes: {
    field: 'title' | 'body' | 'status' | 'subClauses' | 'number';
    oldValue?: any;
    newValue?: any;
  }[];
}

export interface VersionDiffSummary {
  versionOld: string;
  versionNew: string;
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
  items: ClauseDiffItem[];
}

export function compareClauseSnapshots(
  oldClauses: Clause[],
  newClauses: Clause[],
  versionOldName = 'Previous',
  versionNewName = 'Current'
): VersionDiffSummary {
  const oldMap = new Map<string, Clause>();
  oldClauses.forEach((c) => oldMap.set(c.key || `id_${c.id}`, c));

  const newMap = new Map<string, Clause>();
  newClauses.forEach((c) => newMap.set(c.key || `id_${c.id}`, c));

  const items: ClauseDiffItem[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  // Check additions and modifications in newClauses
  newClauses.forEach((newC) => {
    const key = newC.key || `id_${newC.id}`;
    const oldC = oldMap.get(key);

    if (!oldC) {
      addedCount++;
      items.push({
        key,
        numberB: newC.number,
        titleB: newC.title,
        type: 'added',
        changes: [{ field: 'body', newValue: newC.body }],
      });
    } else {
      const changes: ClauseDiffItem['changes'] = [];

      if (oldC.title.trim() !== newC.title.trim()) {
        changes.push({
          field: 'title',
          oldValue: oldC.title,
          newValue: newC.title,
        });
      }
      if (oldC.body.trim() !== newC.body.trim()) {
        changes.push({
          field: 'body',
          oldValue: oldC.body,
          newValue: newC.body,
        });
      }
      if (oldC.status !== newC.status) {
        changes.push({
          field: 'status',
          oldValue: oldC.status,
          newValue: newC.status,
        });
      }
      if (oldC.number !== newC.number) {
        changes.push({
          field: 'number',
          oldValue: oldC.number,
          newValue: newC.number,
        });
      }

      const oldSubs = (oldC.subClauses || []).map((s) => s.body).join('||');
      const newSubs = (newC.subClauses || []).map((s) => s.body).join('||');
      if (oldSubs !== newSubs) {
        changes.push({
          field: 'subClauses',
          oldValue: oldC.subClauses,
          newValue: newC.subClauses,
        });
      }

      if (changes.length > 0) {
        modifiedCount++;
        items.push({
          key,
          numberA: oldC.number,
          numberB: newC.number,
          titleA: oldC.title,
          titleB: newC.title,
          type: 'modified',
          changes,
        });
      } else {
        unchangedCount++;
        items.push({
          key,
          numberA: oldC.number,
          numberB: newC.number,
          titleA: oldC.title,
          titleB: newC.title,
          type: 'unchanged',
          changes: [],
        });
      }
    }
  });

  // Check deletions (in oldClauses but not in newClauses)
  oldClauses.forEach((oldC) => {
    const key = oldC.key || `id_${oldC.id}`;
    if (!newMap.has(key)) {
      removedCount++;
      items.push({
        key,
        numberA: oldC.number,
        numberB: oldC.number,
        titleA: oldC.title,
        titleB: oldC.title,
        type: 'removed',
        changes: [{ field: 'body', oldValue: oldC.body }],
      });
    }
  });

  return {
    versionOld: versionOldName,
    versionNew: versionNewName,
    addedCount,
    removedCount,
    modifiedCount,
    unchangedCount,
    items,
  };
}

