import { createContext, useState } from 'react';

type AppContextValues = {
  intendedRoute: string;
  setIntendedRoute: Function;
};

export const AppContext = createContext<AppContextValues>({
  intendedRoute: '',
  setIntendedRoute: () => {},
});

export default function AppContextProvider({ children }: any) {
  const [intendedRoute, setIntendedRoute] = useState('');

  return (
    <AppContext.Provider value={{ intendedRoute, setIntendedRoute }}>
      {children}
    </AppContext.Provider>
  );
}
