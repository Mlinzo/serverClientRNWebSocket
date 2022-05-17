import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View} from 'react-native';
export default function App() {

  //https://alert-app-fcit.herokuapp.com
  //http://192.168.0.103:5000
  const SOCKET_URL = "https://alert-app-fcit.herokuapp.com"; 
  const [alertLocations, setAlertLocations] = useState({});
  let socket = useRef(null);


  const connectSocket = () => {
    const ping = () => {
      socket.send('__ping__');
      tm = setTimeout(()=>{socket.close()}, 20000);
    }
    const pong = () => { clearTimeout(tm);}

    socket = new WebSocket(SOCKET_URL);
    socket.onopen = () => { 
      socket.send("Socket opened successfully");
      setInterval(ping, 20000);
    }
    socket.onmessage = (msg) => {
      console.log('received from server: ' + JSON.stringify(msg))
      const data = msg.data;
      if (data == '__pong__') {pong(); return;}
      setAlertLocations(data);
    }
    socket.onclose = (e) => {
      console.log('Socket is closed. Reconnecting...', e.reason);
      setTimeout(()=>{connectSocket()}, 3000);
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
  }
});
