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
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupApi } from 'api/auth';
import AppLink from 'components/AppLink';
import PasswordInput from 'components/PasswordInput';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { object, SchemaOf, string } from 'yup';

type SignupInputs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const signupSchema: SchemaOf<SignupInputs> = object().shape({
  email: string().required().email(),
  password: string().required(),
  firstName: string().required(),
  lastName: string().required(),
});

export default function Signup() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = async ({
    email,
    password,
    firstName,
    lastName,
  }: SignupInputs) => {
    setIsLoading(true);
    try {
      await signupApi(email, password, firstName, lastName);
      setIsLoading(false);
      setError('');
      setLocation('/login');
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <Flex align="center" height="100vh" justifyContent="center">
      <Box width="400px" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          <Heading>Signup</Heading>
        </Box>
        <Box my={4}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert my={4} status="error" borderRadius={4}>
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <SimpleGrid columns={2} spacing={2}>
              <FormControl isRequired isInvalid={Boolean(errors.firstName)}>
                <FormLabel htmlFor="firstName">First name</FormLabel>
                <Input
                  autoFocus
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                />
                <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={Boolean(errors.lastName)}>
                <FormLabel htmlFor="lastName">Last name</FormLabel>
                <Input type="text" id="lastName" {...register('lastName')} />
                <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            <FormControl isRequired isInvalid={Boolean(errors.email)} mt={4}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input type="email" id="email" {...register('email')} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.password)} mt={4}>
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
                <CircularProgress isIndeterminate size="24px" color="teal" />
              ) : (
                'Sign up'
              )}
            </Button>
          </form>
        </Box>
        <Box textAlign="center">
          <Text>
            Already have an account?{' '}
            <AppLink color="teal.600" href="/login">
              Login here
            </AppLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
