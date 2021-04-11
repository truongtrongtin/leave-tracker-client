import { Flex, Icon, Text } from '@chakra-ui/react';
import { BiBarChart, BiCalendar, BiUser } from 'react-icons/bi';
import { FaStreetView } from 'react-icons/fa';
import AppLink from './AppLink';

const sidebarItems = [
  {
    icon: BiCalendar,
    name: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: FaStreetView,
    name: 'My Leaves',
    href: '/leaves',
  },
  {
    icon: BiUser,
    name: 'Employees',
    href: '/employees',
  },
  {
    icon: BiBarChart,
    name: 'Statistic',
    href: '/statistics',
  },
];

export default function Sidebar() {
  return (
    <Flex
      direction="column"
      width={{ base: 0, md: 56 }}
      borderRight="1px"
      borderRightColor="gray.200"
      boxShadow="base"
      overflow="auto"
    >
      {sidebarItems.map((item, index) => (
        <AppLink
          key={index}
          href={item.href}
          activeStyle={{ backgroundColor: 'orange.400' }}
          _hover={{ textDecoration: 'none' }}
        >
          <Flex
            padding={3}
            alignItems="center"
            _hover={{ background: 'orange.400', textDecoration: 'none' }}
          >
            <Icon as={item.icon} />
            <Text marginLeft={4}>{item.name}</Text>
          </Flex>
        </AppLink>
      ))}
    </Flex>
  );
}
