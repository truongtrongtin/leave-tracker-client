import React from 'react';
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
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData('currentUser');

  if (currentUser) return <Redirect to="/" />;
  return <Route path={path}>{children}</Route>;
}
