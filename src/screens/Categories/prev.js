import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';

export default function App({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}>
          {/* <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert(
              'Gresize',
              'Congratulations! Your size has been measured. Please proceed to shop.',
              [
                // {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                { text: 'OK', onPress: () => navigation.goBack() },
              ],
              { cancelable: false }
            )}
          // onPress={() => Alert.alert('Congratulations! Your size has been measured. Please proceed to shop.')}
          // onPress={() => navigation.goBack()}
          // onPress={() => {
          //   setType(
          //     type === Camera.Constants.Type.back
          //       ? Camera.Constants.Type.front
          //       : Camera.Constants.Type.back
          //   );
          // }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Ok </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}