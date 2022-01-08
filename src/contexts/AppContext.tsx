import { createContext, ReactChild, useState } from 'react';

type AppContextValues = {
  intendedRoute: string;
  setIntendedRoute: Function;
};

export const AppContext = createContext<AppContextValues>({
  intendedRoute: '',
  setIntendedRoute: () => {},
});

export default function AppContextProvider({
  children,
}: {
  children: ReactChild;
}) {
  const [intendedRoute, setIntendedRoute] = useState('');

  return (
    <AppContext.Provider value={{ intendedRoute, setIntendedRoute }}>
      {children}
    </AppContext.Provider>
  );
}
