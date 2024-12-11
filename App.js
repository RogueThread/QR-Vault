import React, { useState, useEffect } from 'react';
import { Text, View, Button, FlatList } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEmailsWithQR } from './emailService';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    loadQrCodes();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    saveQrCode(data);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const saveQrCode = async (data) => {
    const newQrCodes = [...qrCodes, data];
    setQrCodes(newQrCodes);
    await AsyncStorage.setItem('qrCodes', JSON.stringify(newQrCodes));
  };

  const loadQrCodes = async () => {
    const storedQrCodes = await AsyncStorage.getItem('qrCodes');
    if (storedQrCodes) {
      setQrCodes(JSON.parse(storedQrCodes));
    }
  };

  const fetchEmails = async () => {
    const emails = await getEmailsWithQR();
    emails.forEach(email => saveQrCode(email.qrCode));
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: 400, width: 400 }}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
      <Button title="Fetch QR Codes from Email" onPress={fetchEmails} />
      <FlatList
        data={qrCodes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
  );
}