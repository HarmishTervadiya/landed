import { create } from 'zustand';
import { BaseState, ActionResult, createSafeAction } from '@/utils/safeAction';
import { Application, ApplicationInsert, ApplicationUpdate } from '@/types';
import {
  fetchApplications,
  fetchApplicationById,
  insertApplication,
  updateApplication,
  softDeleteApplication,
} from '@/lib/applications';

export interface ApplicationState extends BaseState {
  applications: Application[];
  selectedApplication: Application | null;

  fetchAll: () => Promise<ActionResult<void>>;
  fetchOne: (id: string) => Promise<ActionResult<void>>;
  create: (data: ApplicationInsert) => Promise<ActionResult<void>>;
  update: (id: string, data: ApplicationUpdate) => Promise<ActionResult<void>>;
  remove: (id: string) => Promise<ActionResult<void>>;
}

export const useApplicationStore = create<ApplicationState>((set, get) => {
  const safeAction = createSafeAction(set);

  return {
    applications: [],
    selectedApplication: null,
    loading: false,
    error: null,

    fetchAll: () =>
      safeAction(async () => {
        const data = await fetchApplications();
        set({ applications: data });
      }),

    fetchOne: (id: string) =>
      safeAction(async () => {
        const data = await fetchApplicationById(id);
        set({ selectedApplication: data });
      }),

    create: (data: ApplicationInsert) =>
      safeAction(async () => {
        const newApp = await insertApplication(data);
        const { applications } = get();
        set({ applications: [newApp, ...applications] });
      }),

    update: (id: string, data: ApplicationUpdate) =>
      safeAction(async () => {
        const updatedApp = await updateApplication(id, data);
        const { applications, selectedApplication } = get();

        set({
          applications: applications.map((app) => (app.id === id ? updatedApp : app)),
          selectedApplication: selectedApplication?.id === id ? updatedApp : selectedApplication,
        });
      }),

    remove: (id: string) =>
      safeAction(async () => {
        await softDeleteApplication(id);
        const { applications, selectedApplication } = get();

        set({
          applications: applications.filter((app) => app.id !== id),
          selectedApplication: selectedApplication?.id === id ? null : selectedApplication,
        });
      }),
  };
});
