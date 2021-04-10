import {
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  useDisclosure,
  useMergeRefs,
} from '@chakra-ui/react';
import { forwardRef, useRef } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { isOpen, onToggle } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);

  const mergeRef = useMergeRefs(inputRef, ref);

  const onClickReveal = () => {
    onToggle();
    const input = inputRef.current;
    if (input) {
      input.focus({ preventScroll: true });
      const length = input.value.length * 2;
      requestAnimationFrame(() => {
        input.setSelectionRange(length, length);
      });
    }
  };

  return (
    <InputGroup>
      <Input type={isOpen ? 'text' : 'password'} ref={mergeRef} {...props} />
      <InputRightElement>
        <IconButton
          aria-label="Toggle password"
          onClick={onClickReveal}
          icon={isOpen ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
        />
      </InputRightElement>
    </InputGroup>
  );
});

export default PasswordInput;
