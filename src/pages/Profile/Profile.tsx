import { Box, Divider } from '@chakra-ui/react';
import { User } from 'api/users';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import AvatarForm from './AvatarForm';
import DateOfBirthForm from './DateOfBirthForm';
import FullNameForm from './FullNameForm';
import PasswordForm from './PasswordForm';

enum EditTarget {
  NONE = 'NONE',
  NAME = 'NAME',
  DATE_OF_BIRTH = 'DATE_OF_BIRTH',
  PASSWORD = 'PASSWORD',
  AVATAR = 'AVATAR',
}

function UserSetting() {
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');
  const [editTarget, setEditTarget] = useState(EditTarget.NONE);

  if (!currentUser) return null;
  return (
    <Box maxWidth="50%">
      <FullNameForm
        isEditing={editTarget === EditTarget.NAME}
        isDisabled={
          editTarget !== EditTarget.NONE && editTarget !== EditTarget.NAME
        }
        onEditClick={() => setEditTarget(EditTarget.NAME)}
        onCancelClick={() => setEditTarget(EditTarget.NONE)}
        firstName={currentUser.firstName}
        lastName={currentUser.lastName}
      />
      <Divider />
      <DateOfBirthForm
        isEditing={editTarget === EditTarget.DATE_OF_BIRTH}
        isDisabled={
          editTarget !== EditTarget.NONE &&
          editTarget !== EditTarget.DATE_OF_BIRTH
        }
        onEditClick={() => setEditTarget(EditTarget.DATE_OF_BIRTH)}
        onCancelClick={() => setEditTarget(EditTarget.NONE)}
        dateOfBirth={currentUser.dateOfBirth}
      />
      <Divider />
      <PasswordForm
        isEditing={editTarget === EditTarget.PASSWORD}
        isDisabled={
          editTarget !== EditTarget.NONE && editTarget !== EditTarget.PASSWORD
        }
        onEditClick={() => setEditTarget(EditTarget.PASSWORD)}
        onCancelClick={() => setEditTarget(EditTarget.NONE)}
      />
      <Divider />
      <AvatarForm
        isEditing={editTarget === EditTarget.AVATAR}
        isDisabled={
          editTarget !== EditTarget.NONE && editTarget !== EditTarget.AVATAR
        }
        onEditClick={() => setEditTarget(EditTarget.AVATAR)}
        onCancelClick={() => setEditTarget(EditTarget.NONE)}
        avatar={currentUser.avatar}
      />
    </Box>
  );
}

export default UserSetting;
