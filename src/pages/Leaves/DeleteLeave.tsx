import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

type DeleteLeaveProps = {
  onClose: () => void;
  isLoading: boolean;
  onSubmit: () => void;
};

function DeleteLeave({ onClose, isLoading, onSubmit }: DeleteLeaveProps) {
  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Leave</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Are you sure want to delete this leave?</ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="red"
            type="submit"
            onClick={onSubmit}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
}

export default DeleteLeave;
