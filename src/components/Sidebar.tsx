import { Flex, Icon, Text } from '@chakra-ui/react';
import { Role, User } from 'api/users';
import { BiBarChart, BiCalendar, BiUser } from 'react-icons/bi';
import { FaStreetView } from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import AppLink from './AppLink';

const sidebarRoutes = [
  {
    icon: BiCalendar,
    name: 'Dashboard',
    href: '/dashboard',
    accessRoles: [Role.MEMBER, Role.ADMIN],
  },
  {
    icon: FaStreetView,
    name: 'My Leaves',
    href: '/leaves',
    accessRoles: [Role.MEMBER, Role.ADMIN],
  },
  {
    icon: BiUser,
    name: 'Employees',
    href: '/employees',
    accessRoles: [Role.MEMBER, Role.ADMIN],
  },
  {
    icon: BiBarChart,
    name: 'Statistic',
    href: '/statistics',
    accessRoles: [Role.ADMIN],
  },
];

export default function Sidebar() {
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');

  if (!currentUser) return null;
  return (
    <Flex
      direction="column"
      width={{ base: 0, md: 56 }}
      borderRight="1px"
      borderRightColor="gray.200"
      boxShadow="base"
      overflow="auto"
    >
      {sidebarRoutes
        .filter((route) => route.accessRoles.includes(currentUser.role))
        .map((route, index) => (
          <AppLink
            key={index}
            href={route.href}
            activeStyle={{ backgroundColor: 'orange.400' }}
            _hover={{ textDecoration: 'none' }}
          >
            <Flex
              padding={3}
              alignItems="center"
              _hover={{ background: 'orange.400', textDecoration: 'none' }}
            >
              <Icon as={route.icon} />
              <Text marginLeft={4}>{route.name}</Text>
            </Flex>
          </AppLink>
        ))}
    </Flex>
  );
}
