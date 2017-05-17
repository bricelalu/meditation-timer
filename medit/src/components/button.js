import MKButton from 'react-native-material-kit';

const Button = MKButton.coloredButton()
  .withText('BUTTON')
  .withOnPress(() => {
    console.log("Hi, it's a colored button!");
  })
  .build();

// Make the Component available to ohter parts of the app
export default Button;
