import React, { createContext, useState } from 'react';

export enum Role {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export type User = {
  id: string;
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
  setIsLoading: Function;
};

export const AppContext = createContext<AppContextValues>({
  currentUser: null,
  setCurrentUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
});

export default function AppContextProvider({ children }: any) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // bootstrap app

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
