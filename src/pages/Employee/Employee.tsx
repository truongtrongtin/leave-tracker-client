import { SimpleGrid } from '@chakra-ui/react';
import EmployeeItem from 'components/EmployeeItem';
import { useQuery } from 'react-query';
import { fetchData } from 'services/fetchData';
import { User } from 'types/user';

export default function Employee() {
  const getUsersQuery = useQuery<User[]>('users', () => fetchData('/users'));
  const users = getUsersQuery.data || [];

  if (getUsersQuery.isLoading) return <div>Loading...</div>;

  return (
    <SimpleGrid columns={[1, 1, 2, 3, 4]} spacing="40px">
      {users.map((user) => {
        const name = user.firstName + ' ' + user.lastName;
        return <EmployeeItem key={user.id} name={name} avatar={user.avatar} />;
      })}
    </SimpleGrid>
  );
}
