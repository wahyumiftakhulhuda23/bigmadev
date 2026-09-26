import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { AppProject, BacklogItem } from '../types';

const APPS_COLLECTION = 'apps';
const TASKS_COLLECTION = 'tasks';

// Clean helper to remove any undefined properties so Firestore doesn't reject them
function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Real-time listener for application projects
 */
export function subscribeToApps(
  onUpdate: (apps: AppProject[]) => void,
  onError?: (err: Error) => void
): () => void {
  const appsRef = collection(db, APPS_COLLECTION);
  return onSnapshot(
    appsRef,
    (snapshot) => {
      const apps: AppProject[] = [];
      snapshot.forEach((d) => {
        apps.push({ id: d.id, ...d.data() } as AppProject);
      });
      // Sort alphabetically or by createdAt
      apps.sort((a, b) => a.name.localeCompare(b.name));
      onUpdate(apps);
    },
    (err) => {
      console.warn('Firestore apps onSnapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for tasks/backlog
 */
export function subscribeToTasks(
  onUpdate: (tasks: BacklogItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const tasksRef = collection(db, TASKS_COLLECTION);
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks: BacklogItem[] = [];
      snapshot.forEach((d) => {
        tasks.push({ id: d.id, ...d.data() } as BacklogItem);
      });
      // Sort newest created first
      tasks.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(tasks);
    },
    (err) => {
      console.warn('Firestore tasks onSnapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Create or update a task document in Firestore
 */
export async function saveTaskToDb(task: BacklogItem): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, task.id);
  const data = cleanFirestoreData(task);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Delete a task document from Firestore
 */
export async function deleteTaskFromDb(taskId: string): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(docRef);
}

/**
 * Create or update an application document in Firestore
 */
export async function saveAppToDb(app: AppProject): Promise<void> {
  const docRef = doc(db, APPS_COLLECTION, app.id);
  const data = cleanFirestoreData(app);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Delete an application document from Firestore
 */
export async function deleteAppFromDb(appId: string): Promise<void> {
  const docRef = doc(db, APPS_COLLECTION, appId);
  await deleteDoc(docRef);
}
