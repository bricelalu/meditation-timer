import React, { Component } from 'react';
import {
  AppRegistry,
  TimePickerAndroid,
  Text,
  View,
  Alert,
  Button,
  StyleSheet,
  TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import renderIf from './src/utils/renderIf';

const Sound = require('react-native-sound');
const Timer = require('react-native-timer');

const gongSound = new Sound('gong.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + gongSound.getDuration() + 'number of channels: ' + gongSound.getNumberOfChannels());
});

class Greeting extends Component {
  render() {
    return (
      <Text>Hello {this.props.name}!</Text>
    );
  }
}

class HelloWorldApp extends Component {
  constructor(props) {
    super(props);
this.onMeditationIntervalEnd = this.onMeditationIntervalEnd.bind(this);
this.onMeditationEnd = this.onMeditationEnd.bind(this);
this.onMeditStart = this.onMeditStart.bind(this);
    this.onButtonPress = this.onButtonPress.bind(this);
    this.onPlayGongButtonPressed = this.onPlayGongButtonPressed.bind(this);
    this.getDurationTitle = this.getDurationTitle.bind(this);
    this.state = {
      isMeditating: false,
      isFirstButtonPressed: false,
      isPlayGongButtonPressed: false,
      presetHour: 0,
      presetMinute: 5,
      totalDurationMinute: 5
    };
  }
  onMeditLengthChoose() {
    Alert.alert('MeditLengthChoose');
  }
  onMeditationIntervalEnd() {
    if (!this.state.isMeditating) {
      Timer.clearInterval(this, 'endIntervalWithOneGong');
    }
    gongSound.play();
  }
  onMeditationEnd() {
    gongSound.setNumberOfLoops(0);
    gongSound.play((success) => {
      gongSound.play((success) => {
        gongSound.play((success) => {
          gongSound.stop();
          gongSound.release();
          Alert.alert('MeditEnd');
          Timer.clearTimeout(this);
        });
      });
    });
    this.setState({ isMeditating: false });
  }
  onMeditStart() {
    gongSound.play();
    this.setState({ isMeditating: true }, () => Timer.setTimeout(
      this, 'endMeditationWithMultipleGongs', this.onMeditationEnd, 15000
    ));
    Timer.setInterval(this, 'endIntervalWithOneGong', this.onMeditationIntervalEnd, 5000);
  }
  onButtonPress() {
    if (this.state.isFirstButtonPressed) {
      this.setState({ isFirstButtonPressed: false });
    } else {
      this.setState({ isFirstButtonPressed: true });
    }

    gongSound.play((success) => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
      }
    });
    Alert.alert('Button has been pressed!');
  }
  onPlayGongButtonPressed() {
    if (this.state.isPlayGongButtonPressed) {
      this.setState({ isPlayGongButtonPressed: true });
    } else {
      this.setState({ isPlayGongButtonPressed: true });
      return (
        <Video
        source={require('./src/components/gong.mp3')}
        repeat={false}
        />
      );
    }

    Alert.alert('You should hear the gong!');
  }
  getDurationTitle() {
      return `Durée : ${this.totalDurationMinute} min `;
  }
  showPicker = async (stateKey, options) => {
    try {
      const { action, minute, hour } = await TimePickerAndroid.open(options);
      var newState = {};
      if (action === TimePickerAndroid.timeSetAction) {
        newState[stateKey + 'Text'] = formatTime(hour, minute);
        newState[stateKey + 'Hour'] = hour;
        newState[stateKey + 'Minute'] = minute;
      } else if (action === TimePickerAndroid.dismissedAction) {
        newState[stateKey + 'Text'] = 'dismissed';
      }
      console.warn(newState);
      this.setState(newState);
    } catch ({ code, message }) {
      console.warn(`Error in example '${stateKey}': `, message);
    }
  }
  render() {
    return (
      <View style={{ alignItems: 'center' }}>
        <Greeting name='Rexxar' />
        <Greeting name='Jaina' />
          <Button
          onPress={this.showPicker.bind(this, 'totalDuration', {
            hour: this.state.presetHour,
            minute: this.state.presetMinute,
            is24Hour: true,
          })}
          title="Durée : 5 minutes"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
          />
          <Button
          onPress={this.showPicker.bind(this, 'intervalDuration', {
            hour: this.state.presetHour,
            minute: this.state.presetMinute,
            is24Hour: true,
          })}
          title="Durée d'intervalle"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
          />
        <Text>{this.state.totalDurationText} text</Text>
        <Text>{this.state.totalDurationHour} hour</Text>
        <Text>{this.state.totalDurationMinute} minutes</Text>
        <Text>Interval: {this.state.intervalDurationMinute} minutes</Text>
        <Button
    onPress={this.onMeditStart}
    title="Lancer"
    color="#841584"
    accessibilityLabel="Learn more about this purple button"
        />
      <Greeting name='Valeera' />
          <Button
    onPress={this.onButtonPress}
    title="Learn More"
    color="#841584"
    accessibilityLabel="Learn more about this purple button"
          />
        {renderIf(this.state.isFirstButtonPressed,
            <Button
      onPress={this.onPlayGongButtonPressed}
      title="Play GONG"
      color="#841584"
      accessibilityLabel="Learn more about this purple button"
            />
        )}
    </View>
    );
  }
}

/**
 * Returns e.g. '3:05'.
 */
function formatTime(hour, minute) {
  return hour + ':' + (minute < 10 ? '0' + minute : minute);
}
AppRegistry.registerComponent('medit', () => HelloWorldApp);
