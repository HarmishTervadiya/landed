import { StoreApi } from 'zustand';

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export interface BaseState {
  loading: boolean;
  error: string | null;
}

export const createSafeAction = <T extends BaseState>(set: StoreApi<T>['setState']) => {
  return async <R>(logic: () => Promise<R> | R): Promise<ActionResult<R>> => {
    set({ loading: true, error: null } as Partial<T>);

    try {
      const result = await logic();

      set({ loading: false } as Partial<T>);
      return { success: true, data: result };
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred';
      console.error('Action Failed:', message);

      set({ loading: false, error: message } as Partial<T>);
      return { success: false, error: message };
    }
  };
};
