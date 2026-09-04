const STORAGE_KEY = 'workify_custom_exercises';
const EVENT_NAME = 'workify_custom_exercises_updated';

export interface CustomExercisesStorage {
  all?: string[];
  [key: string]: unknown; // supports group keys like { "Back": [...], "Arms": [...] }
}

export function getCustomExercises(group?: string): {
  groupExercises: string[];
  allExercises: string[];
  combined: string[];
} {
  if (typeof window === 'undefined') {
    return { groupExercises: [], allExercises: [], combined: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { groupExercises: [], allExercises: [], combined: [] };
    const data: CustomExercisesStorage = JSON.parse(raw);

    // 1. Collect all exercises across all keys
    const allSet = new Set<string>();
    if (Array.isArray(data.all)) {
      data.all.forEach((e) => {
        if (typeof e === 'string' && e.trim()) allSet.add(e.trim());
      });
    }
    for (const [k, val] of Object.entries(data)) {
      if (k !== 'all' && Array.isArray(val)) {
        val.forEach((e) => {
          if (typeof e === 'string' && e.trim()) allSet.add(e.trim());
        });
      }
    }

    // 2. Collect group-specific exercises
    const groupSet = new Set<string>();
    if (group) {
      const key = group.trim();
      if (Array.isArray(data[key])) {
        (data[key] as string[]).forEach((e) => {
          if (typeof e === 'string' && e.trim()) groupSet.add(e.trim());
        });
      }
    }

    const groupExercises = Array.from(groupSet);
    const allExercises = Array.from(allSet);

    // Group-specific combined list: only includes this group's exercises
    // If no group is passed, falls back to all exercises
    const combined = group ? groupExercises : allExercises;

    return { groupExercises, allExercises, combined };
  } catch {
    return { groupExercises: [], allExercises: [], combined: [] };
  }
}

export function saveCustomExercise(newExercise: string, group?: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = newExercise.trim();
  if (!trimmed) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: CustomExercisesStorage = raw ? JSON.parse(raw) : {};

    // 1. Add to group list
    const key = group ? group.trim() : 'general';
    const currentGroupList: string[] = Array.isArray(data[key])
      ? (data[key] as string[])
      : [];
    const inGroup = currentGroupList.includes(trimmed);

    // 2. Add to global all list
    const currentAllList: string[] = Array.isArray(data.all) ? data.all : [];
    const inAll = currentAllList.includes(trimmed);

    if (inGroup && inAll) {
      return;
    }

    if (!inGroup) {
      data[key] = [...currentGroupList, trimmed];
    }
    if (!inAll) {
      data.all = [...currentAllList, trimmed];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Dispatch custom event to notify all listening AestheticSelect components
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { exercise: trimmed, group } })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function removeCustomExercise(
  exerciseToRemove: string,
  group?: string
): void {
  if (typeof window === 'undefined') return;
  const target = exerciseToRemove.trim();
  if (!target) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data: CustomExercisesStorage = JSON.parse(raw);

    // Remove only from the specified group
    if (group) {
      const key = group.trim();
      if (Array.isArray(data[key])) {
        data[key] = (data[key] as string[]).filter((opt) => opt !== target);
      }
    } else {
      // If no group specified, remove from all keys
      for (const [k, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          data[k] = val.filter((opt) => opt !== target);
        }
      }
    }

    // Rebuild global all list from remaining groups
    const remainingAll = new Set<string>();
    for (const [k, val] of Object.entries(data)) {
      if (k !== 'all' && Array.isArray(val)) {
        val.forEach((e) => {
          if (typeof e === 'string' && e.trim()) remainingAll.add(e.trim());
        });
      }
    }
    data.all = Array.from(remainingAll);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { exercise: target, group } })
    );
  } catch {
    // Ignore storage errors
  }
}

export function subscribeToCustomExercises(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}

