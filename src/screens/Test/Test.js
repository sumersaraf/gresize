<script src="http://localhost:8097"></script>
import React from 'react';
import ReactDOM from 'react-dom'
import * as tf from '@tensorflow/tfjs';

import '@tensorflow/tfjs-react-native';

import * as posenet from '@tensorflow-models/posenet';
import { Camera } from 'expo-camera';
import { Text, View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, G, Line } from 'react-native-svg';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import {
  ViroCamera,
  ViroConstants,
} from 'react-viro';

const TensorCamera = cameraWithTensors(Camera);

export default class Test extends React.Component {
  constructor(props) {

    super(props);
    this.state = {
      model: null,
      isTfReady: false,
      pose: null
    };
    this.handleCameraStream = this.handleCameraStream.bind(this);
    this._onInitialized = this._onInitialized.bind(this);
    this.calculateBodyParts = this.calculateBodyParts.bind(this);
    // this.renderPose = this.renderPose.bind(this);

  }
  componentWillUnmount() {
    this.setState({ isTfReady: false })
  }
  async componentDidMount() {
    await Camera.requestPermissionsAsync();

    await tf.ready();
    this.setState({
      isTfReady: true,
    });
  }
  async estimatePoseOnImage(imageElement) {
    const net = await posenet.load();
    const pose = await net.estimateSinglePose(imageElement, {
      flipHorizontal: true,
    });
    this.setState({ pose: pose });
    if (!this.state.leftShoulder || !this.state.rightShoulder || !this.state.leftWrist ||
      !this.state.leftWrist || !this.state.leftHip || !this.state.rightHip || !this.state.leftAnkle) {
      // console.log(pose.keypoints[1])
      pose.keypoints.forEach((b, i) => {
        if (b.score > 0.8) {
          if (i == 5 && (!this.state.leftShoulder || (this.state.leftShoulder && this.state.leftShoulder.score < b.score)))
            this.setState({ leftShoulder: b })
          if (i == 6 && (!this.state.rightShoulder || (this.state.rightShoulder && this.state.rightShoulder.score < b.score)))
            this.setState({ rightShoulder: b })
          if (i == 9 && (!this.state.leftWrist || (this.state.leftWrist && this.state.leftWrist.score < b.score)))
            this.setState({ leftWrist: b })
          if (i == 11 && (!this.state.leftHip || (this.state.leftHip && this.state.leftHip.score < b.score)))
            this.setState({ leftHip: b })
          if (i == 12 && (!this.state.rightHip || (this.state.rightHip && this.state.rightHip.score < b.score)))
            this.setState({ rightHip: b })
          if (i == 15 && (!this.state.leftAnkle || (this.state.leftAnkle && this.state.leftAnkle.score < b.score)))
            this.setState({ leftAnkle: b })
        }
        if (this.state.leftShoulder && this.state.rightShoulder)
          this.calculateBodyParts('shoulder', this.state.leftShoulder, this.state.rightShoulder);
        if (this.state.leftShoulder && this.state.leftWrist)
          this.calculateBodyParts('arms', this.state.leftShoulder, this.state.leftWrist);
        if (this.state.leftHip && this.state.rightHip)
          this.calculateBodyParts('waist', this.state.leftHip, this.state.rightHip);
        if (this.state.leftHip && this.state.leftAnkle)
          this.calculateBodyParts('legs', this.state.leftHip, this.state.leftAnkle);
      })
    }
    // console.log('right hip', this.state.leftHip)
    // console.log('right hip', this.state.leftAnkle)
    return pose;
  }
  calculateBodyParts(bodyPart, begin, end) {
    let distance;
    distance = Math.sqrt(Math.pow((parseInt(begin.position.y) - parseInt(end.position.y)), 2) + Math.pow((parseInt(begin.position.y) - parseInt(end.position.y)), 2))
    this.setState({ [`${bodyPart}`]: distance })

    // console.log('shoudler', this.state.shoulder);
    // console.log('arms', this.state.arms);
    // console.log('waist', this.state.waist);
    // console.log('legs', this.state.legs);
  }
  handleCameraStream(images) {
    console.log('readyyyyyyyy', images)
    const loop = async () => {
      const nextImageTensor = await images.next().value;
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
    let adjacentKeypoints = null;
    if (this.state.pose)
      adjacentKeypoints = posenet.getAdjacentKeyPoints(this.state.pose.keypoints, 0.2);
    // return (
    // <Svg height="100" width="100">
    //   <Circle cx="50" cy="50" r="50" fill="pink" />
    // </Svg>
    // )
    if (!this.state.isTfReady) {
      return (
        <View>
          {/* <PoseNet /> */}
          <Text>Sorry cannot load Tensorflow model</Text>
        </View>
      );
    } else {
      return (
        // <View style={{ flex: 1 }}>
        <View style={styles.cameraContainer}>
          <TensorCamera
            style={stylesNew.camera}
            type={Camera.Constants.Type.back}
            cameraTextureHeight={1200}
            cameraTextureWidth={1600}
            resizeHeight={400}
            resizeWidth={304}
            resizeDepth={3}
            onReady={this.handleCameraStream}
            // onReady={(tensor) => this.handleCameraStream(tensor)}
            autorender={true}
          />
          {/* <Svg style={styles.modelResults}>
            <Circle cx={this.state.rightShoulder ? this.state.rightShoulder.position.x : 50} cy={this.state.rightShoulder ? this.state.rightShoulder.position.y : 50} r="4" fill="pink" />
          </Svg> */}
          <View style={stylesNew.modelResults}>
            <Svg>
              {this.state.pose ? this.state.pose.keypoints.map((k, i) =>
                <Circle
                  key={`skeletonkp_${i}`}
                  cx={parseInt(k.position.x)}
                  cy={parseInt(k.position.y)}
                  r='4'
                  strokeWidth='0.5'
                  fill='blue'
                />
              ) :
                <Circle cx={50} cy={50} r="4" fill="green" />}
              {adjacentKeypoints && this.state.pose ? adjacentKeypoints.map(([from, to], i) =>
                <Line
                  key={`skeletonls_${i}`}
                  x1={from.position.x}
                  y1={from.position.y}
                  x2={to.position.x}
                  y2={to.position.y}
                  stroke='magenta'
                  strokeWidth='1'
                />
              ) : null}
            </Svg>
          </View>
          <Text style={styles.cameraText}>Shoulder:{this.state.shoulder ? this.state.shoulder.toFixed(3) : null}</Text>
          <Text style={styles.cameraText}>Arms:{this.state.arms ? this.state.arms.toFixed(3) : null}</Text>
          <Text style={styles.cameraText}>Waist:{this.state.waist ? this.state.waist.toFixed(3) : null}</Text>
          <Text style={styles.cameraText}>Legs:{this.state.legs ? this.state.legs.toFixed(3) : null}</Text>
        </View>
      )
    }
  }
}

// var styles = StyleSheet.create({
//   helloWorldTextStyle: {
//     fontFamily: 'Arial',
//     fontSize: 30,
//     color: '#ffffff',
//     textAlignVertical: 'center',
//     textAlign: 'center',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraText: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold'
  },
  modelResults: {
    position: 'absolute',
    // flex: 1,
    // justifyContent: 'space-between',

    left: 0,
    top: 0,
    width: 1600,
    height: 1200,
    // zIndex: 200000000,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  }
});

const stylesNew = StyleSheet.create({
  loadingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 200,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  camera: {
    position: 'absolute',
    left: 50,
    top: 100,
    width: 600 / 2,
    height: 800 / 2,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },
  modelResults: {
    position: 'absolute',
    left: 50,
    top: 100,
    width: 600 / 2,
    height: 800 / 2,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  }
});