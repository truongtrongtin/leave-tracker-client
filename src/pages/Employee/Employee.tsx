import { SimpleGrid } from '@chakra-ui/react';
import { getAllUsersApi, User } from 'api/users';
import EmployeeItem from 'components/EmployeeItem';
import { useQuery } from 'react-query';

export default function Employee() {
  const getUsersQuery = useQuery<User[]>('users', () => getAllUsersApi());
  const users = getUsersQuery.data || [];

  if (getUsersQuery.isLoading) return <div>Loading...</div>;

  return (
    <SimpleGrid columns={[1, 2, 3, 4, 5]} spacing="40px">
      {users.map((user) => {
        const name = user.firstName + ' ' + user.lastName;
        return <EmployeeItem key={user.id} name={name} avatar={user.avatar} />;
      })}
    </SimpleGrid>
  );
}
