import { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// These numbers control the bird's movement limits.
const CEILING = 80;
const FLOOR = SCREEN_HEIGHT - 100;

export default function HomeScreen() {
  // This controls how far the bird is from the top of the screen.
  const [birdY, setBirdY] = useState(250);

  // This keeps track of how many times the player flapped.
  const [flapCount, setFlapCount] = useState(0);

  // This function makes the bird flap upward.
  // useCallback helps us safely reuse this function in the keyboard listener.
  const flapBird = useCallback(() => {
    // Move the bird upward, but do not let it go above the ceiling.
    setBirdY((currentY) => {
      return Math.max(currentY - 45, CEILING);
    });

    // Increase the flap counter.
    setFlapCount((currentCount) => currentCount + 1);
  }, []);

  // This creates gravity.
  // Every 30 milliseconds, the bird moves downward a little.
  useEffect(() => {
    const gravity = setInterval(() => {
      setBirdY((currentY) => {
        // Prevent the bird from falling below the floor.
        return Math.min(currentY + 3, FLOOR);
      });
    }, 30);

    // This cleans up the timer when the screen closes.
    return () => clearInterval(gravity);
  }, []);

  // This listens for the spacebar on PC/web.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        // Prevent the browser from scrolling when spacebar is pressed.
        event.preventDefault();

        flapBird();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    // This removes the keyboard listener when the screen closes.
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flapBird]);

  return (
    <Pressable style={styles.screen} onPress={flapBird}>
      <Text style={styles.title}>Feather Dash</Text>
      <Text style={styles.instructions}>Press Spacebar to flap!</Text>
      <Text style={styles.score}>Flaps: {flapCount}</Text>

      {/* Temporary bird. Later we can replace this with an image. */}
      <View style={[styles.bird, { top: birdY }]}>
        <Text style={styles.birdText}>🐦</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#87ceeb",
    alignItems: "center",
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 50,
  },

  instructions: {
    fontSize: 18,
    marginTop: 10,
  },

  score: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },

  bird: {
    position: "absolute",
    left: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  birdText: {
    fontSize: 36,
  },
});