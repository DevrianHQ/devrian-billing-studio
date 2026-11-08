import { Clause, PolicyVariables } from '../types';

/**
 * Resolves all {{variable}} and {{ref:clauseKey}} tokens in a text.
 */
export function resolveVariables(
  text: string,
  variables: PolicyVariables,
  clauses?: Clause[]
): string {
  if (!text) return '';

  return text.replace(/\{\{([^}]+)\}\}/g, (match, rawKey) => {
    const key = rawKey.trim();

    // Check for clause cross-references: e.g. {{ref:refund}} or {{ref:late_payment}}
    if (key.startsWith('ref:')) {
      const refKey = key.slice(4).trim();
      if (clauses && clauses.length > 0) {
        const found = clauses.find(
          (c) => c.key.toLowerCase() === refKey.toLowerCase()
        );
        if (found) {
          return `Clause ${found.number}`;
        }
      }
      return match; // Keep un-replaced if ref not found
    }

    // Standard variable lookup
    if (key in variables) {
      const val = (variables as Record<string, any>)[key];
      return val !== undefined && val !== null ? String(val) : match;
    }

    // Custom variables lookup
    if (variables.custom && key in variables.custom) {
      const val = variables.custom[key];
      return val !== undefined && val !== null ? String(val) : match;
    }

    return match; // Keep as {{key}} if unresolved
  });
}

/**
 * Finds all unresolved {{...}} tokens in a text.
 */
export function findUnresolvedInText(
  text: string,
  variables: PolicyVariables,
  clauses?: Clause[]
): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];

  const unresolved: string[] = [];

  for (const match of matches) {
    const key = match.slice(2, -2).trim();

    if (key.startsWith('ref:')) {
      const refKey = key.slice(4).trim();
      const exists = clauses?.some(
        (c) => c.key.toLowerCase() === refKey.toLowerCase()
      );
      if (!exists) {
        unresolved.push(match);
      }
      continue;
    }

    const inStandard = key in variables;
    const inCustom = variables.custom && key in variables.custom;
    if (!inStandard && !inCustom) {
      unresolved.push(match);
    }
  }

  return Array.from(new Set(unresolved));
}

/**
 * Inspects all clauses and returns any unresolved placeholders.
 */
export function findUnresolvedInClauses(
  clauses: Clause[],
  variables: PolicyVariables
): { clauseNumber: number; clauseTitle: string; placeholders: string[] }[] {
  const results: {
    clauseNumber: number;
    clauseTitle: string;
    placeholders: string[];
  }[] = [];

  for (const clause of clauses) {
    if (!clause.isVisible) continue;

    const unresTitle = findUnresolvedInText(clause.title, variables, clauses);
    const unresBody = findUnresolvedInText(clause.body, variables, clauses);
    const unresSub: string[] = [];

    if (clause.subClauses) {
      for (const sub of clause.subClauses) {
        unresSub.push(...findUnresolvedInText(sub.body, variables, clauses));
      }
    }

    const combined = Array.from(
      new Set([...unresTitle, ...unresBody, ...unresSub])
    );
    if (combined.length > 0) {
      results.push({
        clauseNumber: clause.number,
        clauseTitle: clause.title,
        placeholders: combined,
      });
    }
  }

  return results;
}

/**
 * Count how many times each variable is referenced across clauses.
 */
export function getVariableReferenceCounts(
  clauses: Clause[],
  variables: PolicyVariables
): Record<string, number> {
  const counts: Record<string, number> = {};

  // Initialize keys
  for (const k of Object.keys(variables)) {
    if (k !== 'custom') counts[k] = 0;
  }
  if (variables.custom) {
    for (const k of Object.keys(variables.custom)) {
      counts[k] = 0;
    }
  }

  const allText = clauses
    .filter((c) => c.isVisible)
    .map(
      (c) =>
        `${c.title} ${c.body} ${c.subClauses?.map((s) => s.body).join(' ') || ''}`
    )
    .join(' ');

  const matches = allText.match(/\{\{([^}]+)\}\}/g) || [];
  for (const match of matches) {
    const key = match.slice(2, -2).trim();
    if (!key.startsWith('ref:')) {
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  return counts;
}

