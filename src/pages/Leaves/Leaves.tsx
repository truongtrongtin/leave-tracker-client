import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import LDTable from 'components/LDTable/LDTable';
import { User } from 'types/user';
import { useMemo, useState } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { fetchData } from 'services/fetchData';
import DeleteLeave from './DeleteLeave';
import NewLeave, { NewLeaveInputs } from './NewLeave';

export type Leave = {
  id: string;
  startAt: string;
  endAt: string;
  reason: string;
  status: string;
  user: User;
};

function calculateLeaveDays(leave: Leave): number {
  const diffInHour =
    Math.abs(
      new Date(leave.startAt).getTime() - new Date(leave.endAt).getTime(),
    ) / 3600000;
  return diffInHour === 9 ? 1 : 0.5;
}

function Leaves() {
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onClose: onCloseCreate,
  } = useDisclosure();

  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  const currentUser: User | undefined = queryClient.getQueryData('currentUser');

  const getLeavesQuery = useQuery(
    'myLeaves',
    () => fetchData(`/leaves?userId=${currentUser?.id}`),
    {
      placeholderData: { items: [], meta: {}, links: {} },
    },
  );

  const createLeaveMutation = useMutation(
    (newLeave: NewLeaveInputs) => {
      const { startAt, endAt, reason, userId } = newLeave;
      return fetchData(userId ? '/leaves/admin.add' : '/leaves/add', {
        method: 'POST',
        body: new URLSearchParams({
          startAt,
          endAt,
          reason,
          ...(userId && { userId: userId }),
        }),
      });
    },
    {
      onSuccess: (newLeave: Leave) => {
        queryClient.setQueryData('myLeaves', (old: any) => {
          return { ...old, items: [newLeave, ...old.items] };
        });
        setSelectedLeave(null);
        onCloseCreate();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const updateLeaveMutation = useMutation(
    (newLeave: NewLeaveInputs) =>
      fetchData(`/leaves/${selectedLeave?.id}/edit`, {
        method: 'POST',
        body: new URLSearchParams({
          startAt: newLeave.startAt,
          endAt: newLeave.endAt,
          reason: newLeave.reason,
        }),
      }),
    {
      onSuccess: (newLeave: Leave) => {
        queryClient.setQueryData('myLeaves', (old: any) => {
          const newLeaves = old.items.map((leave: Leave) => {
            if (leave.id === newLeave.id) return newLeave;
            return leave;
          });
          return { ...old, items: newLeaves };
        });
        setSelectedLeave(null);
        onCloseEdit();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const deleteLeaveMutation = useMutation(
    (leaveId: string) =>
      fetchData(`/leaves/${leaveId}/delete`, {
        method: 'POST',
      }),
    {
      onSuccess: (_, leaveId) => {
        queryClient.setQueryData('myLeaves', (old: any) => {
          const newLeaves = old.items.filter(
            (leave: Leave) => leave.id !== leaveId,
          );
          return { ...old, items: newLeaves };
        });
        setSelectedLeave(null);
        onCloseDelete();
        onCloseEdit();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  // const changeLeaveStatus = useCallback(
  //   async (leave: Leave, status: string) => {
  //     if (leave.status === status) return;
  //     try {
  //       setIsLoading(true);
  //       const newLeave = await fetchData(`/leaves/${leave.id}/edit`, {
  //         method: 'POST',
  //         body: new URLSearchParams({ status }),
  //       });
  //       const newLeaves = leaves.map((leave) => {
  //         if (leave.id === newLeave.id) return newLeave;
  //         return leave;
  //       });
  //       setLeaves(newLeaves);
  //       setIsLoading(false);
  //     } catch (error) {
  //       toast({ description: error.message, status: 'error' });
  //       setIsLoading(false);
  //     }
  //   },
  //   [leaves, toast],
  // );

  const data = useMemo(
    () =>
      getLeavesQuery.data?.items.map((leave: Leave) => {
        return {
          employee: leave.user.firstName + ' ' + leave.user.lastName,
          startAt: new Date(leave.startAt).toLocaleString(undefined, {
            hourCycle: 'h23',
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          endAt: new Date(leave.endAt).toLocaleString(undefined, {
            hourCycle: 'h23',
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          noOfDays: calculateLeaveDays(leave),
          reason: leave.reason,
          action: (
            <Menu isLazy>
              <MenuButton as={IconButton} icon={<BiDotsVerticalRounded />} />
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setSelectedLeave(leave);
                    onOpenEdit();
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSelectedLeave(leave);
                    onOpenDelete();
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          ),
        };
      }),
    [onOpenDelete, onOpenEdit, getLeavesQuery],
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Employee',
        accessor: 'employee',
      },
      {
        Header: 'Start At',
        accessor: 'startAt',
      },
      {
        Header: 'End At',
        accessor: 'endAt',
      },
      {
        Header: 'No Of Days',
        accessor: 'noOfDays',
      },
      {
        Header: 'Reason',
        accessor: 'reason',
      },
      {
        Header: 'Action',
        accessor: 'action',
      },
    ],
    [],
  );

  return (
    <Box>
      <Button onClick={onOpenCreate}>Add Leave</Button>
      <LDTable data={data} columns={columns} />
      <Modal isOpen={isOpenCreate} onClose={onCloseCreate}>
        <NewLeave
          onClose={onCloseCreate}
          isSubmiting={createLeaveMutation.isLoading}
          onSubmit={(newLeave) => createLeaveMutation.mutate(newLeave)}
        />
      </Modal>

      {selectedLeave && (
        <Modal isOpen={isOpenEdit} onClose={onCloseEdit}>
          <NewLeave
            leave={selectedLeave}
            onClose={onCloseEdit}
            onDelete={() => deleteLeaveMutation.mutate(selectedLeave.id)}
            isSubmiting={updateLeaveMutation.isLoading}
            onSubmit={(newLeave) => updateLeaveMutation.mutate(newLeave)}
          />
        </Modal>
      )}
      {selectedLeave && (
        <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
          <DeleteLeave
            onClose={onCloseDelete}
            isLoading={deleteLeaveMutation.isLoading}
            onSubmit={() => deleteLeaveMutation.mutate(selectedLeave.id)}
          />
        </Modal>
      )}
    </Box>
  );
}

export default Leaves;
