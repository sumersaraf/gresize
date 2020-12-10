<script src="http://localhost:8097"></script>
import React from 'react';
import ReactDOM from 'react-dom'
import * as tf from '@tensorflow/tfjs';

import '@tensorflow/tfjs-react-native';

import * as posenet from '@tensorflow-models/posenet';
import { Camera } from 'expo-camera';
import { Text, View, TouchableOpacity, Alert, StyleSheet } from 'react-native';

import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import {
  ViroARScene,
  ViroText,
  ViroConstants,
} from 'react-viro';

const TensorCamera = cameraWithTensors(Camera);

export default class Test extends React.Component {
  constructor(props) {

    super(props);
    this.state = {
      model: null,
      isTfReady: false,
      check: 'maa ka bhosada',
      text: "Initializing AR..."
    };
    this.handleCameraStream = this.handleCameraStream.bind(this);
    this._onInitialized = this._onInitialized.bind(this);

  }
  componentWillUnmount() {
    this.setState({ isTfReady: false })
  }
  async componentDidMount() {
    await Camera.requestPermissionsAsync();

    await tf.ready();
    this.setState({
      // model: pose,
      isTfReady: true,
    });
  }
  async estimatePoseOnImage(imageElement) {
    const net = await posenet.load();
    const pose = await net.estimateSinglePose(imageElement, {
      flipHorizontal: false,
    });
    this.setState({ pose: pose });
    console.log('baaap reeeeeeeeeeeeee', pose)
    return pose;
  }
  handleCameraStream(images) {
    console.log('readyyyyyyyy')
    const loop = async () => {
      const nextImageTensor = await images.next().value;
      console.log('image aa gai bawaaa', nextImageTensor)
      await this.estimatePoseOnImage(nextImageTensor);
      requestAnimationFrame(loop);
    };
    if (this.state.isTfReady) {
      loop();
    }

  }
  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text: "Hello World!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }
  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        {/* <ViroText text={this.state.text} scale={[.5, .5, .5]} position={[0, 0, -1]} style={styles.helloWorldTextStyle} /> */}
      </ViroARScene>
    )
    console.log('renderrrr', this.state);
    if (!this.state.isTfReady) {
      return (
        <View>
          {/* <PoseNet /> */}
          <Text>what is {this.state.isTfReady}  {this.state.isTfReady ? 'posenetttttttttttttt' : 'lauda'}</Text>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <TensorCamera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            cameraTextureHeight={1200}
            cameraTextureWidth={1600}
            resizeHeight={200}
            resizeWidth={152}
            resizeDepth={3}
            onReady={this.handleCameraStream}
            // onReady={(tensor) => this.handleCameraStream(tensor)}
            autorender={true}
          />
        </View>
      )
    }
  }
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   camera: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
// });