import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  CircularProgress,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginApi } from 'api/auth';
import AppLink from 'components/AppLink';
import PasswordInput from 'components/PasswordInput';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { useQueryClient } from 'react-query';
import { object, SchemaOf, string } from 'yup';

type LoginInputs = {
  email: string;
  password: string;
};

const loginSchema: SchemaOf<LoginInputs> = object().shape({
  email: string().required().email(),
  password: string().required(),
});

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginInputs) => {
    setIsLoading(true);
    try {
      const currentUser = await loginApi(email, password);
      queryClient.setQueryData('currentUser', currentUser);
      setIsLoading(false);
      setError('');
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <Flex align="center" height="100vh" justifyContent="center">
      <Box width="400px" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          <Heading>Login</Heading>
        </Box>
        <Box my={4}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert my={4} status="error" borderRadius={4}>
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormControl isRequired isInvalid={Boolean(errors.email)}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input autoFocus id="email" type="email" {...register('email')} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.password)} mt={6}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <PasswordInput id="password" {...register('password')} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <Button
              width="full"
              colorScheme="teal"
              variant="outline"
              type="submit"
              mt={8}
            >
              {isLoading ? (
                <CircularProgress isIndeterminate size="24px" />
              ) : (
                'Sign in'
              )}
            </Button>
            <Button
              as="a"
              leftIcon={<FcGoogle />}
              width="full"
              variant="outline"
              type="submit"
              mt={8}
              href={`${process.env.REACT_APP_API_URL}/auth/google`}
            >
              Sign in with Google
            </Button>
          </form>
        </Box>
        <Box textAlign="center">
          <Text>
            Not a member?{' '}
            <AppLink color="teal" href="/signup">
              Signup now
            </AppLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
