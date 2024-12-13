import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native"; 
import { Audio } from "expo-av";


export default function App() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [rhythmTime, setRhythmTime] = useState(0);
  const [isRhythmRunning, setIsRhythmRunning] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [cycles, setCycles] = useState(0);
  const [epinephrineCount, setEpinephrineCount] = useState(0);
  const [shockCount, setShockCount] = useState(0);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [metronomeSound, setMetronomeSound] = useState(null);
  const [metronomeInterval, setMetronomeInterval] = useState(null);
  const [isHelpModalVisible, setHelpModalVisible] = useState(false);

  // Metronome
  const loadMetronomeSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/metronome.wav")
    );
    setMetronomeSound(sound);
  };

  useEffect(() => {
    loadMetronomeSound();

    return () => {
      if (metronomeSound) {
        metronomeSound.unloadAsync();
      }
    };
  }, []);

  const startMetronome = () => {
    if (!metronomeSound) return;

    setIsMetronomeOn(true);
    const interval = setInterval(async () => {
      await metronomeSound.replayAsync();
    }, 500);

    setMetronomeInterval(interval);
  };

  const stopMetronome = () => {
    setIsMetronomeOn(false);
    if (metronomeInterval) {
      clearInterval(metronomeInterval);
      setMetronomeInterval(null);
    }
  };

  const toggleMetronome = () => {
    if (isMetronomeOn) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Format time functions
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatActualTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle adding events to the timeline
  const addEventToTimeline = (event) => {
    const newEvent = { actualTime: formatActualTime(), event };
    setTimeline((prev) => [...prev, newEvent]);
  };

  // Clear timeline
  const clearTimeline = () => setTimeline([]);

  // Timer Handlers
  const handleStart = () => {
    setIsRunning(true);
    addEventToTimeline("Code timer started");
    Alert.alert(
      "Reminder",
      "Chest compressions and epinephrine must be immediately started. Click CPR and Epinephrine when given."
    );
  };

  const handlePause = () => {
    setIsRunning(false);
    addEventToTimeline("Code timer paused");
  };

  const handleEnd = () => {
    setIsRunning(false);
    setIsRhythmRunning(false);
    const summary = `Summary:\nCycles: ${cycles}\nEpinephrine: ${epinephrineCount}\nShocks: ${shockCount}`;
    addEventToTimeline("Code timer ended");
    Alert.alert("Timer Ended", summary);
  };

  // CPR, Epinephrine, and Shock Handlers
  const handleCPR = () => {
    setIsRhythmRunning(true);
    setCycles((prev) => prev + 1);
    addEventToTimeline("Chest compressions started");
  };

  const handleEpinephrine = () => {
    setEpinephrineCount((prev) => prev + 1);
    addEventToTimeline("Epinephrine given");
    setTimeout(() => {
      Alert.alert(
        "Epinephrine Reminder",
        "Administer epinephrine now! Don’t forget to click Epinephrine when given."
      );
      addEventToTimeline("Epinephrine reminder");
    }, 180000); // 3 minutes
  };

  const handleShock = () => {
    setShockCount((prev) => prev + 1);
    addEventToTimeline("Shock delivered");
  };

  // Rhythm Check Alert
  const rhythmCheckAlert = () => {
    setIsRhythmRunning(false);
    Alert.alert("Rhythm Check", "Rhythm checked. Don’t forget to click CPR to restart timer.");
    addEventToTimeline("Rhythm checked");
  };

  // Timers - Update every second
  useEffect(() => {
    let interval = null;
    if (isRunning)
if (isRunning) {
  interval = setInterval(() => {
    setTimeElapsed((prev) => prev + 1);
    if (isRhythmRunning) {
      setRhythmTime((prev) => prev + 1);
      if (rhythmTime >= 120) {
        rhythmCheckAlert();
        setRhythmTime(0);
      }
    }
  }, 1000);
} else {
  clearInterval(interval);
}
return () => clearInterval(interval);
}, [isRunning, isRhythmRunning, rhythmTime]);

return (
<View style={styles.container}>
  {/* Header with Logo and Icons */}
  <View style={styles.header}>
  <View style={styles.headerLeft}>
    <Image
      source={require("./assets/logo.png")} // Replace with your logo file
      style={styles.logoImage} // Add a style for your logo
    />
    <Text style={styles.headerText}>Code Timer</Text>
  </View>
  <View style={styles.headerIcons}>
    <TouchableOpacity onPress={toggleMetronome}>
    <Ionicons name={isMetronomeOn ? "volume-medium-outline" : "volume-mute-outline"} size={24} color={isMetronomeOn ? "green" : "black"} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setHelpModalVisible(true)}>
      <Ionicons name="help-circle" size={24} color="black" style={{ marginLeft: 20 }} />
    </TouchableOpacity>
  </View>
</View>

<Modal
  visible={isHelpModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setHelpModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>How to Use This App</Text>
      <ScrollView>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>Start Timer:</Text> Press Start to begin the elapsed timer. An alert will remind you to initiate chest compressions and administer epinephrine.
        </Text>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>CPR Timer:</Text> Press CPR to start the 2-minute rhythm check countdown. Once the countdown ends, an alert will prompt you to check the rhythm and restart CPR.
        </Text>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>Administer Epinephrine:</Text> Press Epinephrine when a dose is given. An alert will remind you to administer another dose every 3 minutes.
        </Text>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>Record Shocks:</Text> Press Shock to log defibrillation events.
        </Text>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>Pause/Resume Timer:</Text> Use Pause to temporarily stop timers and Resume to continue.
        </Text>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>End Timer:</Text> Press End to stop all timers and view a summary of CPR cycles, epinephrine doses, and shocks.
        </Text>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>View Timeline:</Text> The Timeline logs all events with timestamps for easy reference.
        </Text>
        <Text style={styles.instruction}>
          <Text style={styles.bold}>Clear Timeline:</Text> Press the Clear button to reset the timeline.
        </Text>
      </ScrollView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setHelpModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

  {/* Timers */}
  <Text style={styles.timerLabel}>Time Elapsed</Text>
  <Text style={styles.timer}>{formatElapsedTime(timeElapsed)}</Text>
  <Text style={styles.timerLabel}>Rhythm Check</Text>
  <Text style={styles.rhythmTimer}>{formatElapsedTime(rhythmTime)}</Text>

  {/* Buttons */}
  <View style={styles.buttonRow}>
    <Button title="Start" onPress={handleStart} />
    <Button title="Pause" onPress={handlePause} />
    <Button title="End" onPress={handleEnd} />
  </View>
  <View style={styles.buttonRow}>
    <Button title="CPR" onPress={handleCPR} />
    <Button title="Epinephrine" onPress={handleEpinephrine} />
    <Button title="Shock" onPress={handleShock} />
  </View>

  {/* Timeline */}
  <View style={styles.timelineContainer}>
    <View style={styles.timelineHeader}>
      <Text style={styles.timelineTitle}>Timeline</Text>
      <TouchableOpacity onPress={clearTimeline}>
        <Text style={styles.clearButton}>Clear</Text>
      </TouchableOpacity>
    </View>
    <FlatList
      data={timeline}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.timelineRow}>
          <Text style={styles.timelineTime}>{item.actualTime}</Text>
          <Text style={styles.timelineEvent}>{item.event}</Text>
        </View>
      )}
    />
  </View>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: "#fff" },
header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
headerLeft: { flexDirection: "row", alignItems: "center" },
logo: { fontSize: 36, marginRight: 10 },
headerText: { fontSize: 24, fontWeight: "bold", marginTop: 25 },
headerIcons: { flexDirection: "row", marginTop: 25 },
timerLabel: { fontSize: 18, textAlign: "center", marginTop: 10 },
timer: { fontSize: 36, textAlign: "center", fontWeight: "bold" },
rhythmTimer: { fontSize: 108, textAlign: "center", fontWeight: "bold", color: "red" },
buttonRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
timelineContainer: { marginTop: 20 },
timelineHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
timelineTitle: { fontSize: 18, fontWeight: "bold" },
clearButton: { color: "red", fontSize: 16 },
timelineRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
timelineTime: { fontWeight: "bold" },
timelineEvent: { flex: 1, textAlign: "right" },
logoImage: {
  width: 40, height: 40, marginRight: 10, marginTop: 25},
modalContainer: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},
modalContent: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 20,
  maxHeight: "80%",
},
modalHeader: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
  textAlign: "center",
},
instruction: {
  fontSize: 16,
  marginBottom: 10,
},
bold: {
  fontWeight: "bold",
},
closeButton: {
  marginTop: 20,
  backgroundColor: "red",
  padding: 10,
  borderRadius: 5,
  alignItems: "center",
},
closeButtonText: {
  color: "#fff",
  fontWeight: "bold",
},
icon: {
  fontSize: 24,
  color: "#000",
  margin: 10,
},
});