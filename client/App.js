import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View} from 'react-native';
export default function App() {

  const SOCKET_URL = "http://192.168.0.105:5001" 
  const [alertLocations, setAlertLocations] = useState({});
  let socket = useRef(null);


  const connectSocket = () => {
    socket = new WebSocket(SOCKET_URL);
    socket.onopen = () => socket.send("Socket opened successfully");
    socket.onmessage = ({data}) => setAlertLocations(data);  
    socket.onclose = (e) => {
      console.log('Socket is closed. Reconnecting...', e.reason);
      setTimeout(connectSocket, 3000);
    }
    socket.onerror = (err) => {
      console.error('Socket encountered error: ', err.message, 'Closing socket.');
      socket.close();
    }
  }

  useEffect(() => {
    connectSocket();
  }, []);


  return (
    <View style={styles.container}>
      <View style={{margin: 10}}>
        <View>
          <Text>alert locations on server:{'\n'+JSON.stringify(alertLocations)}</Text>
        </View>
        <StatusBar style="auto"/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
