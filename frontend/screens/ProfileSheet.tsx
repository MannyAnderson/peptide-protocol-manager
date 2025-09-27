import React from 'react';
import Sheet from '../components/Sheet';
import { View, Text } from 'react-native';

const ProfileSheet: React.FC<any> = ({ navigation }) => {
  const visible = true;
  const close = () => navigation.goBack();
  return (
    <Sheet visible={visible} title="Profile" onClose={close}>
      <View>
        <Text>Profile & Settings will go here.</Text>
      </View>
    </Sheet>
  );
};

export default ProfileSheet;


