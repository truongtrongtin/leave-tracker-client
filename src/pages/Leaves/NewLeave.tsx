import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Spacer,
  Textarea,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { fetchData } from 'services/fetchData';
import { Role, User } from 'types/user';
import * as yup from 'yup';
import './date-picker.css';
import { Leave } from './Leaves';

type NewLeaveProps = {
  leave?: Leave;
  isSubmiting: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (newLeave: NewLeaveInputs) => void;
  onDelete?: () => void;
};

export enum DayPart {
  ALL = 'ALL',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

export type NewLeaveInputs = {
  startAt: string;
  endAt: string;
  reason: string;
  userId?: string;
};

export type FormFields = {
  userId: string;
  leaveDate: Date;
  dayPart: DayPart;
  reason: string;
};

const newLeaveSchema = yup.object().shape({
  userId: yup.string().notRequired(),
  leaveDate: yup.date().required(),
  dayPart: yup.string().required(),
  reason: yup.string().required(),
});

const getCurrentBusinessDay = () => {
  const date = new Date();
  const day = date.getDay();
  let add = 0;
  if (day === 6) add = 2; // Saturday
  if (day === 0) add = 1; // Sunday
  date.setDate(date.getDate() + add);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getInitialDayPart = (leave: Leave) => {
  const diffInHour =
    Math.abs(
      new Date(leave.startAt).getTime() - new Date(leave.endAt).getTime(),
    ) / 3600000;

  if (diffInHour === 5) return DayPart.MORNING;
  if (diffInHour === 4) return DayPart.AFTERNOON;
  if (diffInHour === 9) return DayPart.ALL;
};

function NewLeave({
  leave,
  isSubmiting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: NewLeaveProps) {
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');
  const [users, setUsers] = useState<User[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<FormFields>({
    resolver: yupResolver(newLeaveSchema),
    defaultValues: {
      userId: leave?.user.id,
      leaveDate: leave ? new Date(leave.startAt) : getCurrentBusinessDay(),
      reason: leave ? leave.reason : '',
    },
  });

  const isEditing = Boolean(leave);
  const isAdmin = currentUser?.role === Role.ADMIN;

  const handleSubmitLogic = ({
    leaveDate,
    dayPart,
    reason,
    userId,
  }: FormFields) => {
    const startAt = new Date(leaveDate);
    const endAt = new Date(leaveDate);
    if (dayPart === DayPart.MORNING) {
      startAt.setHours(9, 0, 0, 0);
      endAt.setHours(14, 0, 0, 0);
    }
    if (dayPart === DayPart.AFTERNOON) {
      startAt.setHours(14, 0, 0, 0);
      endAt.setHours(18, 0, 0, 0);
    }
    if (dayPart === DayPart.ALL) {
      startAt.setHours(9, 0, 0, 0);
      endAt.setHours(18, 0, 0, 0);
    }
    onSubmit({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reason,
      userId,
    });
  };

  useEffect(() => {
    if (users.length) return;
    const getAllUsers = async () => {
      try {
        const users = await fetchData('/users');
        setUsers(users);
        leave && setValue('userId', leave.user.id);
      } catch (error) {}
    };
    getAllUsers();
  }, [setValue, users, leave]);

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitLogic)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditing ? `${leave?.user.firstName}'s leave` : 'Create Leave'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isAdmin && (
            <FormControl isInvalid={Boolean(errors.userId)}>
              <FormLabel htmlFor="userId">User</FormLabel>
              <Select {...register('userId')} placeholder="Select option">
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.userId?.message}</FormErrorMessage>
            </FormControl>
          )}
          <FormControl isRequired isInvalid={Boolean(errors.leaveDate)}>
            <FormLabel htmlFor="leaveDate">Date</FormLabel>
            <Controller
              name="leaveDate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  selected={value}
                  onChange={onChange}
                  dateFormat="E MMM d, yyyy"
                  placeholderText="Select a weekday"
                  autoFocus={!Boolean(leave)}
                  filterDate={(date) =>
                    date.getDay() !== 0 &&
                    date.getDay() !== 6 &&
                    (isAdmin ||
                      date >= new Date(new Date().setHours(0, 0, 0, 0)))
                  }
                />
              )}
            />
            <FormErrorMessage>{errors.leaveDate?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={Boolean(errors.dayPart)} mt={4}>
            <Controller
              name="dayPart"
              control={control}
              defaultValue={leave ? getInitialDayPart(leave) : DayPart.ALL}
              render={({ field: { onChange, value } }) => (
                <RadioGroup value={value} onChange={onChange}>
                  <HStack>
                    <Radio id={DayPart.ALL} value={DayPart.ALL}>
                      All day
                    </Radio>
                    <Radio id={DayPart.MORNING} value={DayPart.MORNING}>
                      Only morning
                    </Radio>
                    <Radio id={DayPart.AFTERNOON} value={DayPart.AFTERNOON}>
                      Only afternoon
                    </Radio>
                  </HStack>
                </RadioGroup>
              )}
            />
          </FormControl>
          <FormControl isRequired isInvalid={Boolean(errors.reason)} mt={4}>
            <FormLabel htmlFor="reason">Reason</FormLabel>
            <Textarea {...register('reason')} />
            <FormErrorMessage>{errors.reason?.message}</FormErrorMessage>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          {isEditing && (
            <Button
              colorScheme="red"
              mr={3}
              onClick={onDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          )}
          <Spacer />
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
          {
            <Button colorScheme="blue" type="submit" isLoading={isSubmiting}>
              Submit
            </Button>
          }
        </ModalFooter>
      </ModalContent>
    </form>
  );
}

export default NewLeave;
