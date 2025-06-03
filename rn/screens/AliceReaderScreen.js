import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import Tts from 'react-native-tts';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

const AliceReaderScreen = () => {
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tags, setTags] = useState('');
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const loadText = async () => {
      const fileUri = FileSystem.documentDirectory + 'alice.txt';
      const text = await FileSystem.readAsStringAsync(fileUri);
      setContent(text);
    };
    loadText();
  }, []);

  const speakText = () => {
    Tts.stop();
    Tts.speak(content.slice(0, 800));
  };

  const highlightQuote = () => {
    if (selectedText.length > 0) {
      setModalVisible(true);
    } else {
      Alert.alert("No text selected", "Please long press a paragraph to highlight.");
    }
  };

  const saveQuote = () => {
    const note = {
      quote: selectedText,
      tags: tags.split(',').map(t => t.trim()),
      audioNote: recordingUri
    };
    console.log("Saved note:", note);
    Alert.alert("Quote saved", `Tags: ${note.tags.join(', ')}\nAudio: ${note.audioNote || 'None'}`);
    setModalVisible(false);
    setSelectedText('');
    setTags('');
    setRecordingUri('');
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingUri(uri);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {content.split('\n\n').map((para, idx) => (
          <TouchableOpacity key={idx} onLongPress={() => setSelectedText(para)}>
            <Text style={[styles.paragraph, selectedText === para && styles.highlight]}>{para}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.controls}>
        <Button title="Read Aloud" onPress={speakText} />
        <Button title="Save Highlight" onPress={highlightQuote} />
        <Button title="Back to Library" onPress={() => navigation.goBack()} />
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Tag Your Quote</Text>
          <TextInput placeholder="Enter tags (comma separated)" value={tags} onChangeText={setTags} style={styles.input} />
          <Button title={recording ? "Stop Recording" : "Record Audio Note"} onPress={recording ? stopRecording : startRecording} />
          <Button title="Save Quote" onPress={saveQuote} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: '#fff' },
  scroll: { marginBottom: 20 },
  paragraph: { fontSize: 18, lineHeight: 28, marginBottom: 16, color: '#333' },
  highlight: { backgroundColor: '#ffffcc', borderRadius: 6, padding: 4 },
  controls: { paddingBottom: 20 },
  modal: { marginTop: 150, marginHorizontal: 20, backgroundColor: 'white', padding: 20, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, marginBottom: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, marginVertical: 10, fontSize: 16 }
});

export default AliceReaderScreen;