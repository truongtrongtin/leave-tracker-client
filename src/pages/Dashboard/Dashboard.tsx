import { Box, Button, Center, useDisclosure, useToast } from '@chakra-ui/react';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { Leave } from 'pages/Leaves/Leaves';
import NewLeaveModal, { NewLeaveInputs } from 'pages/Leaves/NewLeaveModal';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchData } from 'services/fetchData';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Dashboard() {
  const toast = useToast();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const getAllLeaves = async () => {
      try {
        setIsLoading(true);
        const leaves = await fetchData('/leaves');
        setLeaves(leaves.items);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    getAllLeaves();
  }, []);

  const createLeave = async ({ startAt, endAt, reason }: NewLeaveInputs) => {
    setIsLoading(true);
    try {
      const newLeave = await fetchData(`/leaves/add`, {
        method: 'POST',
        body: new URLSearchParams({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          reason,
        }),
      });
      setIsLoading(false);
      setLeaves([newLeave, ...leaves]);
      onCloseCreate();
    } catch (error) {
      setIsLoading(false);
      onCloseCreate();
    }
  };

  const updateLeave = async ({ startAt, endAt, reason }: NewLeaveInputs) => {
    if (!selectedLeave) return;
    try {
      setIsLoading(true);
      const newLeave = await fetchData(`/leaves/${selectedLeave.id}/edit`, {
        method: 'POST',
        body: new URLSearchParams({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          reason,
        }),
      });
      const newLeaves = leaves.map((leave) => {
        if (leave.id === newLeave.id) return newLeave;
        return leave;
      });
      setLeaves(newLeaves);
      setIsLoading(false);
      onCloseEdit();
    } catch (error) {
      toast({ description: error.message, status: 'error' });
      setIsLoading(false);
      onCloseEdit();
    }
  };

  const deleteLeave = async () => {
    if (!selectedLeave) return;
    try {
      setIsLoading(true);
      await fetchData(`/leaves/${selectedLeave.id}/delete`, {
        method: 'POST',
      });
      const newLeaves = leaves.filter((leave) => leave.id !== selectedLeave.id);
      setIsLoading(false);
      onCloseEdit();
      setLeaves(newLeaves);
    } catch (error) {
      toast({ description: error.message, status: 'error' });
      setIsLoading(false);
    }
  };

  const handleLeaveSelect = (leave: Leave) => {
    setSelectedLeave(leave);
    onOpenEdit();
  };

  const generateDayPart = (leave: Leave) => {
    const startAtHour = new Date(leave.startAt).getHours();
    const endAtHour = new Date(leave.endAt).getHours();

    if (startAtHour === 9 && endAtHour === 14) return 'morning';
    if (startAtHour === 14 && endAtHour === 18) return 'afternoon';
    if (startAtHour === 9 && endAtHour === 18) return 'all day';
  };

  const mappedLeaves = leaves.map((leave) => {
    return {
      ...leave,
      start: new Date(leave.startAt),
      end: new Date(leave.endAt),
      title: `${leave.user.firstName} off ${generateDayPart(leave)}`,
    };
  });

  console.log('mappedLeaves', mappedLeaves);

  return (
    <Box height="100%">
      <Center>
        <Button mx="auto" colorScheme="green" onClick={onOpenCreate}>
          Add Leave
        </Button>
      </Center>
      <Box height="calc(100% - 40px)">
        <Calendar
          popup
          localizer={localizer}
          events={mappedLeaves}
          onSelectEvent={handleLeaveSelect}
        />
      </Box>
      <NewLeaveModal
        isOpen={isOpenCreate}
        onClose={onCloseCreate}
        isLoading={isLoading}
        onSubmit={createLeave}
        onDelete={deleteLeave}
      />
      {selectedLeave && (
        <NewLeaveModal
          leave={selectedLeave}
          isOpen={isOpenEdit}
          onClose={onCloseEdit}
          onDelete={deleteLeave}
          isLoading={isLoading}
          onSubmit={updateLeave}
        />
      )}
    </Box>
  );
}
