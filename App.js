import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { authorize, refresh, revoke } from 'react-native-app-auth';
import axios from 'axios';

const config = {
  issuer: 'https://accounts.google.com',
  clientId: '',
  redirectUrl: 'http://localhost',
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
};

export default function App() {
  const [accessToken, setAccessToken] = React.useState('');
  const [labels, setLabels] = React.useState([]);
  const [error, setError] = React.useState('');

  // Function to initiate OAuth2 authentication
  const handleLogin = async () => {
    try {
      const authState = await authorize(config);
      const { accessToken } = authState;

      // Store the access token in state
      setAccessToken(accessToken);

      // Use the access token to fetch Gmail labels
      const apiUrl = 'https://www.googleapis.com/gmail/v1/users/me/labels';
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      axios
        .get(apiUrl, { headers })
        .then((response) => {
          setLabels(response.data.labels);
        })
        .catch((error) => {
          setError('Error fetching labels: ' + error.message);
        });
    } catch (error) {
      setError('OAuth2 Error: ' + error.message);
    }
  };

  // Function to log out and revoke access
  const handleLogout = async () => {
    try {
      await revoke(config, { tokenToRevoke: accessToken });
      setAccessToken('');
      setLabels([]);
    } catch (error) {
      setError('Error revoking access: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Gmail Label Viewer</Text>
      {accessToken ? (
        <View>
          <Button title="Log Out" onPress={handleLogout} />
          <Text style={styles.label}>Access Token: {accessToken}</Text>
          {labels.length > 0 && (
            <Text style={styles.label}>Gmail Labels:</Text>
          )}
          <Text style={styles.label}>
            {labels.map((label) => label.name).join(', ')}
          </Text>
        </View>
      ) : (
        <Button title="Log In with Google" onPress={handleLogin} />
      )}
      {error !== '' && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
