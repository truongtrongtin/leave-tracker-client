import { createContext } from "react";

type User = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type AppContextValues = {
  currentUser: User | null;
  setCurrentUser: Function;
};

const AppContext = createContext<AppContextValues>({
  currentUser: null,
  setCurrentUser: () => {},
});

export default AppContext;
