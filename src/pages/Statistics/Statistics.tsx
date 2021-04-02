import { useQuery } from 'react-query';
import { fetchData } from 'services/fetchData';

export default function Statistic() {
  const getUsersLeavesCountQuery = useQuery('haha', () =>
    fetchData(`/leaves/countUsersLeaves?year=${new Date().getFullYear()}`),
  );

  console.log(getUsersLeavesCountQuery.data);

  return (
    <div>
      {getUsersLeavesCountQuery.data?.map((user: any) => (
        <span>
          {user.email} ----- {user.sum} day(s)
          <br />
        </span>
      ))}
    </div>
  );
}
