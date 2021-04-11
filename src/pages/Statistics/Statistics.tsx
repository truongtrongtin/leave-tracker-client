import { Text } from '@chakra-ui/layout';
import { useQuery } from 'react-query';
import { fetchData } from 'services/fetchData';

export default function Statistic() {
  const getUsersLeavesCountQuery = useQuery('haha', () =>
    fetchData(`/leaves/countUsersLeaves?year=${new Date().getFullYear()}`),
  );

  return (
    <div>
      <Text>All member's leaves in 2021</Text>
      {getUsersLeavesCountQuery.data?.map((user: any) => (
        <span key={user.id}>
          {user.first_name} {user.last_name} ----- {user.sum} day(s)
          <br />
        </span>
      ))}
    </div>
  );
}
