import { AppContext } from 'contexts/AppContext';
import React, { useContext } from 'react';
import { useQueryClient } from 'react-query';
import { Redirect, Route } from 'wouter';

type LoggedOutRouteProps = {
  path: string;
  children: React.ReactChild;
};

export default function LoggedOutRoute({
  path,
  children,
}: LoggedOutRouteProps) {
  const { intendedRoute } = useContext(AppContext);
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData('currentUser');

  if (currentUser) return <Redirect to={intendedRoute || '/'} />;
  return <Route path={path}>{children}</Route>;
}
