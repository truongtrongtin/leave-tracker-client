import { createContext } from 'react';

export enum Role {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  avatar: string;
};

export const initialUser = {
  id: 0,
  email: '',
  firstName: '',
  lastName: '',
  createdAt: '',
  updatedAt: '',
  role: Role.MEMBER,
  avatar: '',
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
