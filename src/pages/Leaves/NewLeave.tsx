import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
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
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Leave } from 'api/leaves';
import { Role, User } from 'api/users';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { AnyObjectSchema, date, object, string } from 'yup';
import './date-picker.css';

type NewLeaveProps = {
  leave?: Leave;
  isLoading: boolean;
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
  id: string;
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

const newLeaveSchema: AnyObjectSchema = object().shape({
  userId: string().notRequired(),
  leaveDate: date().required(),
  dayPart: string().required(),
  reason: string().notRequired(),
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
  isLoading,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: NewLeaveProps) {
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');
  const users: User[] | undefined = queryClient.getQueryData('users');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
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
      id: leave ? leave.id : '',
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reason,
      userId,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitLogic)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditing
            ? `${leave?.user.firstName} ${leave?.user.lastName}'s leave`
            : 'Create Leave'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isAdmin && (
            <FormControl isInvalid={Boolean(errors.userId)}>
              <FormLabel htmlFor="userId">User</FormLabel>
              <Select
                id="userId"
                {...register('userId')}
                placeholder="Select option"
              >
                {(users || []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.userId?.message}</FormErrorMessage>
            </FormControl>
          )}
          <FormControl isRequired isInvalid={Boolean(errors.leaveDate)} mt={4}>
            <FormLabel htmlFor="leaveDate">Date</FormLabel>
            <Controller
              name="leaveDate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  id="leaveDate"
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
          <FormControl isInvalid={Boolean(errors.reason)} mt={4}>
            <FormLabel htmlFor="reason">Reason (optional)</FormLabel>
            <Input id="reason" {...register('reason')} />
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
            <Button colorScheme="blue" type="submit" isLoading={isLoading}>
              Submit
            </Button>
          }
        </ModalFooter>
      </ModalContent>
    </form>
  );
}

export default NewLeave;
