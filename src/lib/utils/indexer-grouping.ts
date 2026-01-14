/**
 * Utility: Indexer Grouping by Categories
 * Documentation: documentation/phase3/prowlarr.md
 *
 * Groups indexers by their category configuration to minimize API calls.
 * Indexers with identical categories are grouped together for a single search.
 */

export interface IndexerConfig {
  id: number;
  name: string;
  priority?: number;
  categories?: number[];
  [key: string]: any; // Allow other properties
}

export interface IndexerGroup {
  categories: number[];
  indexerIds: number[];
  indexers: IndexerConfig[];
}

/**
 * Groups indexers by their category configuration.
 * Indexers with identical category arrays are grouped together.
 *
 * @param indexers - Array of indexer configurations
 * @returns Array of groups, each containing indexers with matching categories
 *
 * @example
 * const indexers = [
 *   { id: 1, categories: [3030] },
 *   { id: 2, categories: [3030] },
 *   { id: 3, categories: [3030, 3010] },
 * ];
 *
 * const groups = groupIndexersByCategories(indexers);
 * // Result:
 * // [
 * //   { categories: [3030], indexerIds: [1, 2], indexers: [...] },
 * //   { categories: [3030, 3010], indexerIds: [3], indexers: [...] }
 * // ]
 */
export function groupIndexersByCategories(indexers: IndexerConfig[]): IndexerGroup[] {
  // Map to track unique category combinations
  // Key: sorted category IDs as string (e.g., "3030,3010")
  // Value: array of indexers with those categories
  const groupMap = new Map<string, IndexerConfig[]>();

  for (const indexer of indexers) {
    // Get categories, default to [3030] (audiobooks) if not specified
    const categories = indexer.categories && indexer.categories.length > 0
      ? indexer.categories
      : [3030];

    // Sort categories to ensure consistent grouping
    // [3030, 3010] and [3010, 3030] should be the same group
    const sortedCategories = [...categories].sort((a, b) => a - b);
    const key = sortedCategories.join(',');

    // Add indexer to group
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(indexer);
  }

  // Convert map to array of groups
  const groups: IndexerGroup[] = [];
  for (const [key, indexersInGroup] of groupMap.entries()) {
    const categories = key.split(',').map(Number);
    const indexerIds = indexersInGroup.map(idx => idx.id);

    groups.push({
      categories,
      indexerIds,
      indexers: indexersInGroup,
    });
  }

  return groups;
}

/**
 * Get a human-readable description of an indexer group.
 * Useful for logging and debugging.
 *
 * @param group - The indexer group
 * @returns Description string
 *
 * @example
 * const description = getGroupDescription(group);
 * // "3 indexers (IDs: 1, 2, 5) searching categories [3030, 3010]"
 */
export function getGroupDescription(group: IndexerGroup): string {
  const indexerCount = group.indexerIds.length;
  const indexerNames = group.indexers.map(idx => idx.name).join(', ');
  const categoriesStr = group.categories.join(', ');

  return `${indexerCount} indexer${indexerCount > 1 ? 's' : ''} (${indexerNames}) with categories [${categoriesStr}]`;
}
