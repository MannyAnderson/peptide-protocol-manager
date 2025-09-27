import React from 'react';
import Sheet from '../components/Sheet';
import { View, Text } from 'react-native';

const DailyTrackingSheet: React.FC<any> = ({ navigation }) => {
  const visible = true;
  const close = () => navigation.goBack();
  return (
    <Sheet visible={visible} title="Log Daily" onClose={close}>
      <View>
        <Text>Simple form placeholder for daily tracking.</Text>
      </View>
    </Sheet>
  );
};

export default DailyTrackingSheet;


