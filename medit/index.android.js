import React, { Component } from 'react';
import {
  AppRegistry,
  TimePickerAndroid,
  Text,
  View,
  Alert,
  Button } from 'react-native';
import NumberPickerDialog from 'react-native-numberpicker-dialog';
import Header from './src/components/header';

const Sound = require('react-native-sound');
const Timer = require('react-native-timer');

const preparationTimeInSecond = 5;
const gongSound = new Sound('chime.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + gongSound.getDuration() + 'number of channels: ' + gongSound.getNumberOfChannels());
});

let minutes = 5;
let intervalDurationMinute = 1;

class HelloWorldApp extends Component {
  constructor(props) {
    super(props);
    this.onMeditationIntervalEnd = this.onMeditationIntervalEnd.bind(this);
    this.onPreparationEnd = this.onPreparationEnd.bind(this);
    this.onMeditationEnd = this.onMeditationEnd.bind(this);
    this.onMeditStart = this.onMeditStart.bind(this);
    this.onButtonPress2 = this.onButtonPress2.bind(this);
    this.onIntervalChange = this.onIntervalChange.bind(this);
    this.getDurationTitle = this.getDurationTitle.bind(this);
    this.state = {
      isMeditating: false,
      isFirstButtonPressed: false,
      isPlayGongButtonPressed: false,
      presetHour: 0,
      presetMinute: minutes,
      intervalMinute: intervalDurationMinute,
      totalDurationMinute: 5
    };
    const timeValues = [];
    for (let i = 0; i < 60; i++) {
      timeValues.push(i);
    }
    this.state.timeValues = timeValues;
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
  onPreparationEnd() {
    gongSound.play();
    Timer.setTimeout(
      this,
      'endMeditationWithMultipleGongs',
      this.onMeditationEnd,
      minutes * 60 * 1000
    );
  }
  onMeditStart() {
    this.setState({ isMeditating: true }, () => Timer.setTimeout(
      this,
      'startMeditationPreparation',
      this.onPreparationEnd,
      // preparation time
      preparationTimeInSecond * 1000)
    );

    Timer.setInterval(
      this,
      'endIntervalWithOneGong',
      this.onMeditationIntervalEnd,
      intervalDurationMinute * 60 * 1000
    );
  }

  onButtonPress2() {
    const timeValues = [];
    for (let i = 0; i < 60; i++) {
      timeValues.push(i.toString());
    }
    NumberPickerDialog.show({
      values: timeValues,
      positiveButtonLabel: 'Ok',
      negativeButtonLabel: 'Cancel',
      value: minutes.toString(),
      message: 'Durée de la séance',
      title: 'Combien de temps (minutes) allez vous pratiquer ?',
    }).then((id) => {
      if (id !== -1) {
        minutes = parseInt(timeValues[id], 10);
        this.setState({ presetMinute: parseInt(timeValues[id], 10) });
      }
      // id is the index of the chosen item, or -1 if the user cancelled.
    });
  }

  onIntervalChange() {
    const timeValues = [];
    for (let i = 0; i < 60; i++) {
      timeValues.push(i.toString());
    }
    NumberPickerDialog.show({
      values: timeValues,
      positiveButtonLabel: 'Ok',
      negativeButtonLabel: 'Cancel',
      value: intervalDurationMinute.toString(),
      message: 'Durée des intervalles',
      title: 'Combien de temps (minutes) entre chaque gong ?',
    }).then((id) => {
      if (id !== -1) {
        intervalDurationMinute = parseInt(timeValues[id], 10);
        this.setState({ intervalMinute: parseInt(timeValues[id], 10) });
      }
      // id is the index of the chosen item, or -1 if the user cancelled.
    });
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
  //<Text>{this.state.totalDurationText} text</Text>
  //<Text>{this.state.totalDurationHour} hour</Text>
  //<Text>{this.state.totalDurationMinute} minutes</Text>
  //<Text>Interval: {this.state.intervalDurationMinute} minutes</Text>
  render() {
    return (
      <View
        style={{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
        <Header headerText={'Gong de méditation'} />
        <View style={{ flex: 0.5, justifyContent: 'center' }}>
        <Text
          style={{
            backgroundColor: '#808080',
            textAlignVertical: 'center',
            textAlign: 'center',
            fontSize: 100,
            color: '#fffafa',
            width: 180,
            height: 180,
            borderRadius: 90,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            elevation: 2,
            margin: 20
          }}
        >{this.state.presetMinute}</Text>
      <Button
        onPress={this.onButtonPress2}
        title="Changer la durée"
      />
      <Button
        onPress={this.onMeditStart}
        title="Démarrer"
        color="#841584"
        style={{ width: 180, margin: 20, padding: 30 }}
        accessibilityLabel="Learn more about this purple button"
      />
      </View>
      <View style={{ flex: 0.1 }}>
        <Button
          onPress={this.onIntervalChange}
          title="Changer l'intervalle"
          style={{ width: 360 }}
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
      <Text>Intervalle: {this.state.intervalMinute} minutes</Text>
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
