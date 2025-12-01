
import { Project, Reference, Note, Task, User, Annotation, Manuscript } from '../types';

const STORAGE_KEYS = {
  USER: 'academiapro_user',
  PROJECTS: 'academiapro_projects',
  REFERENCES: 'academiapro_refs',
  NOTES: 'academiapro_notes',
  TASKS: 'academiapro_tasks',
  ANNOTATIONS: 'academiapro_annotations',
  MANUSCRIPTS: 'academiapro_manuscripts',
};

// --- User Auth Simulation ---
export const login = async (email: string): Promise<User> => {
  const user: User = {
    id: 'u1',
    name: 'Dr. Researcher',
    email,
    avatar: 'https://picsum.photos/200',
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(STORAGE_KEYS.USER);
  return u ? JSON.parse(u) : null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// --- Projects ---
export const getProjects = (): Project[] => {
  const p = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return p ? JSON.parse(p) : [];
};

export const saveProject = (project: Project) => {
  const projects = getProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const deleteProject = (id: string) => {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

// --- References ---
export const getReferences = (projectId: string): Reference[] => {
  const allRefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERENCES) || '[]');
  return allRefs.filter((r: Reference) => r.projectId === projectId);
};

export const getAllReferences = (): Reference[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERENCES) || '[]');
};

export const addReference = (ref: Reference) => {
  const allRefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERENCES) || '[]');
  allRefs.push(ref);
  localStorage.setItem(STORAGE_KEYS.REFERENCES, JSON.stringify(allRefs));
};

export const updateReference = (ref: Reference) => {
    const allRefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERENCES) || '[]');
    const idx = allRefs.findIndex((r: Reference) => r.id === ref.id);
    if (idx >= 0) {
        allRefs[idx] = ref;
        localStorage.setItem(STORAGE_KEYS.REFERENCES, JSON.stringify(allRefs));
    }
};

export const deleteReference = (id: string) => {
  let allRefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERENCES) || '[]');
  allRefs = allRefs.filter((r: Reference) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REFERENCES, JSON.stringify(allRefs));
};

// --- Annotations ---
export const getAnnotations = (referenceId: string): Annotation[] => {
    const allAnns = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOTATIONS) || '[]');
    return allAnns.filter((a: Annotation) => a.referenceId === referenceId);
};

export const saveAnnotation = (annotation: Annotation) => {
    const allAnns = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOTATIONS) || '[]');
    allAnns.push(annotation);
    localStorage.setItem(STORAGE_KEYS.ANNOTATIONS, JSON.stringify(allAnns));
};

// --- Notes ---
export const getNotes = (projectId: string): Note[] => {
  const allNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
  return allNotes.filter((n: Note) => n.projectId === projectId);
};

export const getAllNotes = (): Note[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
}

export const saveNote = (note: Note) => {
  const allNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
  const idx = allNotes.findIndex((n: Note) => n.id === note.id);
  if (idx >= 0) {
    allNotes[idx] = note;
  } else {
    allNotes.push(note);
  }
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(allNotes));
};

// --- Tasks ---
export const getTasks = (projectId: string): Task[] => {
  const allTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  return allTasks.filter((t: Task) => t.projectId === projectId);
};

export const saveTask = (task: Task) => {
  const allTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  const idx = allTasks.findIndex((t: Task) => t.id === task.id);
  if (idx >= 0) {
    allTasks[idx] = task;
  } else {
    allTasks.push(task);
  }
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks));
};

export const deleteTask = (id: string) => {
    let allTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    allTasks = allTasks.filter((t: Task) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks));
}

// --- Manuscripts ---
export const getManuscript = (projectId: string): Manuscript | null => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MANUSCRIPTS) || '[]');
    return all.find((m: Manuscript) => m.projectId === projectId) || null;
};

export const saveManuscript = (manuscript: Manuscript) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MANUSCRIPTS) || '[]');
    const idx = all.findIndex((m: Manuscript) => m.id === manuscript.id);
    if (idx >= 0) {
        all[idx] = manuscript;
    } else {
        all.push(manuscript);
    }
    localStorage.setItem(STORAGE_KEYS.MANUSCRIPTS, JSON.stringify(all));
};
