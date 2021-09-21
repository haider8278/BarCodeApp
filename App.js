import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned')
  const [checkIn, setCheckIn] = useState(false);
  const [checkOut, setCheckOut] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })()
  }

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);


  const clickedActionButton = (param) => {
    setShowScanner(true);
    if(param == 'checkin'){
      setCheckIn(true);
    }
    if(param == 'checkout'){
      setCheckOut(true);
    }
  }

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    setShowScanner(false);
    setScanned(false);
    setText(data)
    console.log('Type: ' + type + '\nData: ' + data)
    let actionType;
    let msg;
    if(checkIn){
      actionType = 'checkin';
      msg = "Successfully Checkin";
    }
    if(checkOut){
      actionType = 'checkout';
      msg = "Successfully Checkout";
    }
    const params = new URLSearchParams();
    params.append('barcode', data);
    params.append('actionType', actionType);
    axios.post('https://schoolsplus.pk/barcode.php', params)
    .then(function (response) {

      setCheckIn(false);
      setCheckOut(false);
      setText(response.data.msg);
      alert(response.data.msg);
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

  };


  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>)
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>)
  }


    // Return Checkin Checkout view
    return (
      <View style={styles.container}>
        {showScanner &&
        <View style={styles.barcodebox}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ height: 400, width: 400 }} />
        </View>
        }
        <Text style={styles.maintext}>{text}</Text>
        <View style={styles.fixToText}>
          <Button style={styles.button} title={'CheckIn'} onPress={() => clickedActionButton('checkin')} />
          <Button style={styles.button} title={'CheckOut'} onPress={() => clickedActionButton('checkout')}  />
        </View>
      </View>
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    alignItems:'center',
    justifyContent: 'center',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  button:{
    margin:20,
  },
  h1: {
    fontSize: 26,
    margin: 20,
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato'
  }
});
