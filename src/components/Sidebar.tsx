import { Flex, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import { FaRegCalendarTimes } from 'react-icons/fa';
import { BiUser } from 'react-icons/bi';
import AppLink from './AppLink';

const sidebarItems = [
  {
    icon: FaRegCalendarTimes,
    name: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: FaRegCalendarTimes,
    name: 'My Leaves',
    href: '/leaves',
  },
  {
    icon: BiUser,
    name: 'Employees',
    href: '/employees',
  },
  {
    icon: BiUser,
    name: 'Statistic',
    href: '/statistics',
  },
];
console.log('This is from sidebar');

export default function Sidebar() {
  return (
    <Flex
      direction="column"
      width={56}
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
