import { Role, User } from 'api/users';
import { useQueryClient } from 'react-query';
import { Redirect, Route } from 'wouter';

type AdminRouteProps = {
  path: string;
  children: React.ReactChild;
};

export default function AdminRoute({ path, children }: AdminRouteProps) {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<User | undefined>('currentUser');

  if (currentUser?.role === Role.ADMIN) {
    return <Route path={path}>{children}</Route>;
  }
  return <Redirect to="/login" />;
}
