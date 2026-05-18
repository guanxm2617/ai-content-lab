export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}
