import React, { Component } from 'react';
import {
  NativeModules,
  AppRegistry,
  Text,
  View,
  Alert,
  Button } from 'react-native';
import AlarmAndroid from 'react-native-alarms';
import Header from './src/components/header';

const NumberPickerDialog = NativeModules.RNNumberPickerDialog;
const Sound = require('react-native-sound');

const preparationTimeInSecond = 5;
const gongSound = new Sound('bell10s.ogg', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + gongSound.getDuration() + 'number of channels: ' + gongSound.getNumberOfChannels());
});
const finalGongSound = new Sound('final_gong.ogg', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + gongSound.getDuration() + 'number of channels: ' + gongSound.getNumberOfChannels());
});

let minutes = 5;
let intervalDurationMinute = 0;
const timeValues = [];

class MeditationApp extends Component {
  constructor(props) {
    super(props);
    this.onMeditationIntervalEnd = this.onMeditationIntervalEnd.bind(this);
    this.onPreparationEnd = this.onPreparationEnd.bind(this);
    this.deleteAlarms = this.deleteAlarms.bind(this);
    this.onCancelMeditation = this.onCancelMeditation.bind(this);
    this.onMeditationEnd = this.onMeditationEnd.bind(this);
    this.onMeditStart = this.onMeditStart.bind(this);
    this.onOneMinutePassed = this.onOneMinutePassed.bind(this);
    this.onDurationChange = this.onDurationChange.bind(this);
    this.onIntervalChange = this.onIntervalChange.bind(this);
    this.getDurationTitle = this.getDurationTitle.bind(this);
    this.handleDurationValueChange = this.handleDurationValueChange.bind(this);
    this.handleIntervalValueChange = this.handleIntervalValueChange.bind(this);
    this.state = {
      isMeditating: false,
      isFirstButtonPressed: false,
      isPlayGongButtonPressed: false,
      presetHour: 0,
      presetMinute: minutes,
      intervalMinute: intervalDurationMinute,
      totalDurationMinute: 5
    };
    for (let i = 0; i < 60; i++) {
      timeValues.push(i.toString());
    }
    this.state.timeValues = timeValues;
  }

  onMeditationIntervalEnd() {
    if (!this.state.isMeditating || this.state.presetMinute === 0) {
      this.deleteAlarms();
    }
    gongSound.play();
  }

  onOneMinutePassed() {
    if (this.state.isMeditating) {
      this.setState({ presetMinute: this.state.presetMinute - 1 });
    } else {
      this.deleteAlarms();
    }
  }

  onCancelMeditation() {
    this.deleteAlarms();
    this.setState({
      isMeditating: false,
      presetMinute: minutes
    });
  }

  onMeditationEnd() {
    finalGongSound.setNumberOfLoops(0);
    finalGongSound.play((success) => {
      finalGongSound.stop();
      finalGongSound.release();
      Alert.alert('Fin de la séance = Avec conscience vous pouvez vous lever.');

      this.deleteAlarms();
      this.setState({
        isMeditating: false,
        presetMinute: minutes
      });
    });
  }

  onPreparationEnd() {
    gongSound.play();
  }

  onMeditStart() {
    this.setState({ isMeditating: true });
    // STEP 1: Create FINAL Alarm
    AlarmAndroid.alarmSetElapsedRealtimeWakeup(
      'endMeditationWithMultipleGongs',
      // preparation time
      minutes * 60 * 1000
    );
    // add the listener
    AlarmAndroid.AlarmEmitter.addListener(
      'endMeditationWithMultipleGongs',
      this.onMeditationEnd
    );

    // STEP 2: Create Preparation Alarm
    // create alarm
    AlarmAndroid.alarmSetElapsedRealtimeWakeup(
      'startMeditationPreparation',
      // preparation time
      preparationTimeInSecond * 1000
    );
    // add the listener
    AlarmAndroid.AlarmEmitter.addListener(
      'startMeditationPreparation',
      this.onPreparationEnd
    );

    // STEP 3: Create Interval Alarm
    if (intervalDurationMinute > 0) {
      // create alarm gong interval
      AlarmAndroid.alarmSetElapsedRealtimeWakeup(
        'endIntervalWithOneGong',
        // preparation time
        intervalDurationMinute * 60 * 1000,
        intervalDurationMinute * 60 * 1000
      );
      // create listener for gong interval
      AlarmAndroid.AlarmEmitter.addListener(
        'endIntervalWithOneGong',
        this.onMeditationIntervalEnd
      );
    }
    // STEP 4: Decrease Total Duration
    AlarmAndroid.alarmSetElapsedRealtimeWakeup(
      'decreaseTotalDuration',
      // preparation time
      60000,
      60000
    );
    AlarmAndroid.AlarmEmitter.addListener(
      'decreaseTotalDuration',
      this.onOneMinutePassed
    );
  }

  onDurationChange() {
    NumberPickerDialog.show({
      values: timeValues,
      positiveButtonLabel: 'Ok',
      negativeButtonLabel: 'Annuler',
      value: minutes.toString(),
      message: 'Durée de la séance',
      title: 'Combien de temps (minutes) allez vous pratiquer ?',
    }, this.handleDurationValueChange, this.handleDurationValueChange);
  }

  onIntervalChange() {
    NumberPickerDialog.show({
      values: timeValues,
      positiveButtonLabel: 'Ok',
      negativeButtonLabel: 'Annuler',
      value: intervalDurationMinute.toString(),
      message: 'Durée des intervalles',
      title: 'Combien de temps (minutes) entre chaque gong ?',
    }, this.handleIntervalValueChange, this.handleIntervalValueChange);
  }

  getDurationTitle() {
      return `Durée : ${this.totalDurationMinute} min `;
  }

  deleteAlarms() {
    AlarmAndroid.clearAlarm('endMeditationWithMultipleGongs');
    AlarmAndroid.clearAlarm('startMeditationPreparation');
    AlarmAndroid.clearAlarm('endIntervalWithOneGong');
    AlarmAndroid.clearAlarm('decreaseTotalDuration');
  }

  handleDurationValueChange(id) {
    if (id !== -1) {
      minutes = parseInt(timeValues[id], 10);
      this.setState({ presetMinute: parseInt(timeValues[id], 10) });
    }
  }

  handleIntervalValueChange(id) {
    if (id !== -1) {
      intervalDurationMinute = parseInt(timeValues[id], 10);
      this.setState({ intervalMinute: parseInt(timeValues[id], 10) });
    }
  }

  render() {
    let meditationText = null;
    let displayButtons = null;
    if (this.state.isMeditating) {
      meditationText = <Text style={{ textAlign: 'center', fontSize: 20, color: '#FFF', fontWeight: 'bold' }}>Méditation en cours</Text>;
      displayButtons = (
        <View>
          <Button
            onPress={this.onCancelMeditation}
            title="Annuler"
          />
      </View>);
    } else {
      displayButtons = (
      <View>
      <Button
        onPress={this.onDurationChange}
        title="Changer la durée"
      />
      <Button
        onPress={this.onMeditStart}
        title="Démarrer"
        color="#841584"
        style={{ width: 180, margin: 20, padding: 30 }}
      /></View>);
    }
    return (
      <View
        style={{
      backgroundColor: '#696969',
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
      {meditationText}
      {displayButtons}
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
      <Text>Intervalle: {this.state.intervalMinute} minute(s)</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('medit', () => MeditationApp);
