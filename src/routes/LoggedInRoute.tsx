import { AppContext } from 'contexts/AppContext';
import React, { useContext, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { Redirect, Route, useLocation } from 'wouter';

type LoggedInRouteProps = {
  path: string;
  children: React.ReactChild;
};

export default function LoggedInRoute({ path, children }: LoggedInRouteProps) {
  const [location] = useLocation();
  const { setIntendedRoute } = useContext(AppContext);
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData('currentUser');
  const queryState = queryClient.getQueryState('currentUser');

  useEffect(() => {
    if (!currentUser && !queryState?.isFetching) {
      setIntendedRoute(location);
    }
  }, [currentUser, queryState, location, setIntendedRoute]);

  if (!currentUser && !queryState?.isFetching) {
    return <Redirect to="/login" />;
  }

  return <Route path={path}>{children}</Route>;
}
