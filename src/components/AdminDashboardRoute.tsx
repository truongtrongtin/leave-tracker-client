import { Box, Flex } from '@chakra-ui/react';
import React from 'react';
import { useQueryClient } from 'react-query';
import { Role, User } from 'types/user';
import { Redirect, Route } from 'wouter';
import Header from './Header';
import Sidebar from './Sidebar';

type AdminDashboardRouteProps = {
  path: string;
  children: React.ReactChild;
};

export default function AdminDashboardRoute({
  path,
  children,
}: AdminDashboardRouteProps) {
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');
  const queryState = queryClient.getQueryState('currentUser');

  if (
    (!currentUser && !queryState?.isFetching) ||
    currentUser?.role !== Role.ADMIN
  )
    return <Redirect to="/login" />;
  return (
    <Route path={path}>
      <Header />
      <Flex marginTop={14} height="calc(100vh - 56px)">
        <Sidebar />
        <Box flex={1} overflow="auto">
          {/* <Breadcrumb mb={4}>
              <BreadcrumbItem>
                <Link href="/">
                  <BreadcrumbLink>Home</BreadcrumbLink>
                </Link>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href={path}>
                  {path
                    .replace(/\//g, "")
                    .split(" ")
                    .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
                    .join(" ")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb> */}
          {children}
        </Box>
      </Flex>
    </Route>
  );
}
