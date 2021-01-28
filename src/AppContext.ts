import { createContext } from "react";

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
};

type AppContextValues = {
  currentUser: User | null;
  setCurrentUser: Function;
  isLoading: boolean;
};

const AppContext = createContext<AppContextValues>({
  currentUser: null,
  setCurrentUser: () => {},
  isLoading: false,
});

export default AppContext;
