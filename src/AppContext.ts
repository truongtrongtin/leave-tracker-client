import { createContext } from 'react';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
};

export const initialUser = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  createdAt: '',
  updatedAt: '',
};

type AppContextValues = {
  currentUser: User;
  setCurrentUser: Function;
  isLoading: boolean;
};

const AppContext = createContext<AppContextValues>({
  currentUser: initialUser,
  setCurrentUser: () => {},
  isLoading: false,
});

export default AppContext;
