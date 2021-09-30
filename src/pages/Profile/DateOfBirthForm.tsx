import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  SimpleGrid,
  Text,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { editCurrentUserApi, User } from 'api/users';
import ReactDatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { AnyObjectSchema, date, object } from 'yup';

type DateOfBirthFormProps = {
  isEditing: boolean;
  isDisabled: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  dateOfBirth?: Date;
};

const dateOfBirthSchema: AnyObjectSchema = object().shape({
  dateOfBirth: date().required(),
});

type InputFields = {
  dateOfBirth: Date;
};

export default function DateOfBirthForm({
  isEditing,
  isDisabled,
  onEditClick,
  onCancelClick,
  dateOfBirth,
}: DateOfBirthFormProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InputFields>({
    resolver: yupResolver(dateOfBirthSchema),
  });

  const handleCancelClick = () => {
    onCancelClick();
    reset();
  };

  const updateDateOfBirth = useMutation(
    (fields: InputFields) =>
      editCurrentUserApi({ dateOfBirth: fields.dateOfBirth.toISOString() }),
    {
      onSuccess: (newUser: User) => {
        queryClient.setQueryData('currentUser', newUser);
        toast({ description: 'Successfully updated', status: 'success' });
        handleCancelClick();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  return (
    <Box padding={2}>
      <HStack justifyContent="space-between">
        <Text as="b">Date of birth</Text>
        <Button
          colorScheme="teal"
          variant="link"
          onClick={isEditing ? handleCancelClick : onEditClick}
          isDisabled={isDisabled}
        >
          {isEditing ? 'Cancel' : dateOfBirth ? 'Edit' : 'Add'}
        </Button>
      </HStack>
      {isEditing ? (
        <form
          noValidate
          onSubmit={handleSubmit((fields) => updateDateOfBirth.mutate(fields))}
        >
          <SimpleGrid columns={2} spacing={2} mt={4}>
            <FormControl
              style={{ zIndex: 1 }}
              isInvalid={Boolean(errors.dateOfBirth)}
            >
              <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
              <Controller
                name="dateOfBirth"
                control={control}
                defaultValue={dateOfBirth ? new Date(dateOfBirth) : undefined}
                render={({ field: { value, onChange } }) => (
                  <ReactDatePicker
                    id="dateOfBirth"
                    selected={value}
                    onChange={onChange}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Date of birth"
                    showYearDropdown
                  />
                )}
              />
              <FormErrorMessage>{errors.dateOfBirth?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          <Button
            marginTop={3}
            colorScheme="blue"
            type="submit"
            isLoading={updateDateOfBirth.isLoading}
          >
            Save
          </Button>
        </form>
      ) : (
        <Text>
          {dateOfBirth
            ? new Date(dateOfBirth).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Not provided'}
        </Text>
      )}
    </Box>
  );
}
