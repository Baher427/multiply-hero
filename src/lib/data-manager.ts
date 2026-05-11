// ─── Data Manager ─────────────────────────────────────────────────────────
// A robust data persistence layer with retry, batch, auto-save, and recovery.

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second for exponential backoff
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const BACKUP_PREFIX = 'mh_backup_';
const SYNC_KEY = 'mh_sync_status';

interface SyncStatus {
  lastSaveTime: number | null;
  pendingChanges: number;
  lastSyncError: string | null;
  isSynced: boolean;
}

interface BatchOperation {
  url: string;
  method: string;
  body: unknown;
}

// ─── Save with Retry ────────────────────────────────────────────────────────

export async function saveWithRetry(
  url: string,
  method: string,
  body: unknown,
  maxRetries: number = MAX_RETRIES
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  let lastError: string = '';

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        updateSyncStatus(true);
        return { success: true, data };
      }

      // Non-retriable status codes
      if (response.status === 400 || response.status === 404 || response.status === 401) {
        const data = await response.json().catch(() => ({}));
        lastError = data.error || `HTTP ${response.status}`;
        break;
      }

      lastError = `HTTP ${response.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network error';
    }

    // Exponential backoff
    if (attempt < maxRetries - 1) {
      const delay = BASE_DELAY * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  updateSyncStatus(false, lastError);
  return { success: false, error: lastError };
}

// ─── Batch Save ─────────────────────────────────────────────────────────────

export async function saveBatch(operations: BatchOperation[]): Promise<{ success: boolean; results: Array<{ success: boolean; data?: unknown; error?: string }> }> {
  const results = await Promise.allSettled(
    operations.map(op => saveWithRetry(op.url, op.method, op.body))
  );

  const processedResults = results.map(result => {
    if (result.status === 'fulfilled') return result.value;
    return { success: false, error: 'Batch operation failed' };
  });

  const allSuccess = processedResults.every(r => r.success);
  updateSyncStatus(allSuccess);

  return { success: allSuccess, results: processedResults };
}

// ─── Auto-Save ──────────────────────────────────────────────────────────────

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(
  getData: () => { childId: string; data: unknown } | null,
  onSave?: (success: boolean) => void
): void {
  stopAutoSave();
  
  autoSaveTimer = setInterval(async () => {
    const state = getData();
    if (!state) return;

    // Save to local backup
    try {
      localStorage.setItem(`${BACKUP_PREFIX}${state.childId}`, JSON.stringify({
        data: state.data,
        timestamp: Date.now(),
      }));
      onSave?.(true);
    } catch {
      onSave?.(false);
    }
  }, AUTO_SAVE_INTERVAL);
}

export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

// ─── Sync Status ────────────────────────────────────────────────────────────

export function syncStatus(): SyncStatus {
  if (typeof window === 'undefined') {
    return { lastSaveTime: null, pendingChanges: 0, lastSyncError: null, isSynced: true };
  }

  try {
    const stored = localStorage.getItem(SYNC_KEY);
    if (!stored) {
      return { lastSaveTime: null, pendingChanges: 0, lastSyncError: null, isSynced: true };
    }
    return JSON.parse(stored);
  } catch {
    return { lastSaveTime: null, pendingChanges: 0, lastSyncError: null, isSynced: true };
  }
}

function updateSyncStatus(success: boolean, error?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const current = syncStatus();
    const updated: SyncStatus = {
      lastSaveTime: success ? Date.now() : current.lastSaveTime,
      pendingChanges: success ? 0 : current.pendingChanges + 1,
      lastSyncError: error || null,
      isSynced: success,
    };
    localStorage.setItem(SYNC_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

// ─── Data Recovery ──────────────────────────────────────────────────────────

export function recoverData(childId: string): { data: unknown; timestamp: number } | null {
  if (typeof window === 'undefined') return null;

  try {
    const backup = localStorage.getItem(`${BACKUP_PREFIX}${childId}`);
    if (!backup) return null;
    return JSON.parse(backup);
  } catch {
    return null;
  }
}

export function clearBackup(childId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${BACKUP_PREFIX}${childId}`);
  } catch { /* ignore */ }
}

// ─── Export / Import ────────────────────────────────────────────────────────

export async function exportData(childId: string): Promise<string | null> {
  try {
    const [childRes, progressRes, badgesRes, sessionsRes] = await Promise.all([
      fetch(`/api/children/${childId}`),
      fetch(`/api/progress?childId=${childId}`),
      fetch(`/api/badges?childId=${childId}`),
      fetch(`/api/game-session?childId=${childId}&limit=100`),
    ]);

    const childData = await childRes.json();
    const progressData = await progressRes.json();
    const badgesData = await badgesRes.json();
    const sessionsData = await sessionsRes.json();

    const exportObj = {
      exportDate: new Date().toISOString(),
      child: childData.success ? childData.data.child : null,
      progress: progressData.success ? progressData.data : [],
      badges: badgesData.success ? badgesData.data : [],
      sessions: sessionsData.success ? sessionsData.data : [],
    };

    return JSON.stringify(exportObj, null, 2);
  } catch (error) {
    console.error('Export failed:', error);
    return null;
  }
}

export async function importData(jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonString);

    if (!data.child) {
      return { success: false, error: 'بيانات الطفل غير موجودة في الملف' };
    }

    // Create or update child
    const existingChildRes = await fetch(`/api/children/${data.child.id}`);
    const existingChild = await existingChildRes.json();

    if (existingChild.success) {
      // Update existing child
      await fetch(`/api/children/${data.child.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: data.child.displayName,
          age: data.child.age,
          points: data.child.points,
          level: data.child.level,
          stars: data.child.stars,
          coins: data.child.coins,
          gems: data.child.gems,
          streak: data.child.streak,
        }),
      });
    } else {
      // Create new child
      await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.child.name,
          displayName: data.child.displayName,
          age: data.child.age,
          avatarId: data.child.avatarId,
          favoriteColor: data.child.favoriteColor,
        }),
      });
    }

    // Import badges
    if (data.badges && Array.isArray(data.badges)) {
      for (const badge of data.badges) {
        await fetch('/api/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childId: data.child.id, badgeType: badge.badgeType }),
        });
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'فشل في استيراد البيانات - ملف غير صالح' };
  }
}
