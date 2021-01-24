import {
  Button,
  CircularProgress,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useForm } from "react-hook-form";
import { fetchData } from "services/fetchData";
import "./date-picker.css";
import { Leave, User } from "./Leaves";

type EditLeaveProps = {
  leave: Leave;
  isOpen: boolean;
  onClose: () => void;
  onFinishSubmit: (newLeave: Leave) => void;
};

type EditLeaveInputs = {
  from: Date;
  to: Date;
  reason: string;
  user: User;
};

function EditLeaveModal({
  leave,
  isOpen,
  onClose,
  onFinishSubmit,
}: EditLeaveProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, errors, control } = useForm();

  const onSubmit = async ({ from, to, reason }: EditLeaveInputs) => {
    setIsLoading(true);
    try {
      const newLeave = await fetchData(`/leaves/${leave.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
          reason,
        }),
      });
      console.log(newLeave);
      setIsLoading(false);
      onFinishSubmit(newLeave);
      onClose();
    } catch (error) {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Leave</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired isInvalid={Boolean(errors.from)} mt={4}>
              <FormLabel htmlFor="from">From</FormLabel>
              <Controller
                name="from"
                defaultValue={new Date(leave.from)}
                control={control}
                render={({ onChange, value }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    showTimeSelect
                    dateFormat="E MMM d, yyyy h:mm aa"
                  />
                )}
              />
              <FormErrorMessage>{errors.from?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.to)} mt={4}>
              <FormLabel htmlFor="to">To</FormLabel>
              <Controller
                name="to"
                defaultValue={new Date(leave.to)}
                control={control}
                render={({ onChange, value }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    showTimeSelect
                    dateFormat="E MMM d, yyyy h:mm aa"
                  />
                )}
              />
              <FormErrorMessage>{errors.to?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.reason)} mt={4}>
              <FormLabel htmlFor="reason">Reason</FormLabel>
              <Textarea
                ref={register}
                name="reason"
                defaultValue={leave.reason}
              />
              <FormErrorMessage>{errors.reason?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" type="submit">
              {isLoading ? (
                <CircularProgress isIndeterminate size="24px" color="teal" />
              ) : (
                "Submit"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default EditLeaveModal;
