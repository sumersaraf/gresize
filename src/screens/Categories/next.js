import * as React from 'react';
import { Text, View, StyleSheet, Image, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';

const TensorCamera = cameraWithTensors(Camera);

export default class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleCameraStream = this.handleCameraStream.bind(this);
  }

  async estimatePoseOnImage(imageElement) {
    const net = await posenet.load();
    const pose = await net.estimateSinglePose(imageElement, {
      flipHorizontal: false,
    });
    this.setState({ pose: pose });
    return pose;
  }

  handleCameraStream( images ) {
    const loop = async () => {
      const nextImageTensor = await images.next().value;
      await this.estimatePoseOnImage(nextImageTensor);
      
      requestAnimationFrame(loop);
    };
    loop();
  }

  render() {
    return (
      <View>
        <TensorCamera
          type={Camera.Constants.Type.front}
          onReady={this.handleCameraStream}
          autorender={true}
        />
      </View>
    );
  }
}