import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Bird settings
const BIRD_LEFT = 100;
const BIRD_SIZE = 60;

// Bird movement boundaries
const CEILING = 20;
const FLOOR = SCREEN_HEIGHT - 80;

// Pipe settings
const PIPE_WIDTH = 70;
const PIPE_SPEED = 5;
const TOP_PIPE_HEIGHT = 150;
const GAP_HEIGHT = 230;
const BOTTOM_PIPE_TOP = TOP_PIPE_HEIGHT + GAP_HEIGHT;

export default function HomeScreen() {
  // Controls how far the bird is from the top of the screen.
  const [birdY, setBirdY] = useState(250);

  // Counts how many times the player flapped.
  const [flapCount, setFlapCount] = useState(0);

  // Tracks the player's score.
  const [score, setScore] = useState(0);

  // Prevents the same pipe from giving more than one point.
  const [hasScoredPipe, setHasScoredPipe] = useState(false);

  // Controls the pipe's horizontal position.
  const [pipeX, setPipeX] = useState(SCREEN_WIDTH);

  // Tracks whether the player has hit a pipe.
  const [gameOver, setGameOver] = useState(false);

  // Resets the game after a collision.
  function resetGame() {
    setBirdY(250);
    setFlapCount(0);
    setScore(0);
    setHasScoredPipe(false);
    setPipeX(SCREEN_WIDTH);
    setGameOver(false);
  }

  // Makes the bird flap upward.
  const flapBird = useCallback(() => {
    // If the game is over, pressing space/tapping restarts the game.
    if (gameOver) {
      resetGame();
      return;
    }

    // Move the bird upward, but do not let it go above the ceiling.
    setBirdY((currentY) => {
      return Math.max(currentY - 45, CEILING);
    });

    // Increase the flap counter.
    setFlapCount((currentCount) => currentCount + 1);
  }, [gameOver]);

  // Gravity: moves the bird downward over time.
  useEffect(() => {
    const gravity = setInterval(() => {
      setBirdY((currentY) => {
        // If the game is over, freeze the bird.
        if (gameOver) {
          return currentY;
        }

        // Prevent the bird from falling below the floor.
        return Math.min(currentY + 3, FLOOR);
      });
    }, 30);

    return () => clearInterval(gravity);
  }, [gameOver]);

  // Pipe movement: moves the pipes from right to left.
  useEffect(() => {
    const pipeMovement = setInterval(() => {
      setPipeX((currentX) => {
        // If the game is over, freeze the pipes.
        if (gameOver) {
          return currentX;
        }

        // If the pipe goes off the left side,
        // reset it back to the right side.
        if (currentX < -PIPE_WIDTH) {
          setHasScoredPipe(false);
          return SCREEN_WIDTH;
        }

        return currentX - PIPE_SPEED;
      });
    }, 30);

    return () => clearInterval(pipeMovement);
  }, [gameOver]);

  // Scoring: gives the player 1 point when the bird passes the pipe.
  useEffect(() => {
    if (gameOver) {
      return;
    }

    const pipeRight = pipeX + PIPE_WIDTH;

    // Once the pipe is fully left of the bird, the bird has passed it.
    if (pipeRight < BIRD_LEFT && !hasScoredPipe) {
      setScore((currentScore) => currentScore + 1);
      setHasScoredPipe(true);
    }
  }, [pipeX, hasScoredPipe, gameOver]);

  // Collision detection.
  useEffect(() => {
    if (gameOver) {
      return;
    }

    // Bird hitbox
    const birdLeft = BIRD_LEFT;
    const birdRight = BIRD_LEFT + BIRD_SIZE;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_SIZE;

    // Shared pipe hitbox values
    const pipeLeft = pipeX;
    const pipeRight = pipeX + PIPE_WIDTH;

    // Top pipe hitbox
    const topPipeTop = 0;
    const topPipeBottom = TOP_PIPE_HEIGHT;

    // Bottom pipe hitbox
    const bottomPipeTop = BOTTOM_PIPE_TOP;
    const bottomPipeBottom = SCREEN_HEIGHT;

    // Checks if the bird overlaps the top pipe.
    const hitsTopPipe =
      birdRight > pipeLeft &&
      birdLeft < pipeRight &&
      birdBottom > topPipeTop &&
      birdTop < topPipeBottom;

    // Checks if the bird overlaps the bottom pipe.
    const hitsBottomPipe =
      birdRight > pipeLeft &&
      birdLeft < pipeRight &&
      birdBottom > bottomPipeTop &&
      birdTop < bottomPipeBottom;

    if (hitsTopPipe || hitsBottomPipe) {
      setGameOver(true);
    }
  }, [birdY, pipeX, gameOver]);

  // Spacebar controls for PC/web.
  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    function handleKeyDown(event: any) {
      if (event.code === "Space") {
        event.preventDefault();
        flapBird();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flapBird]);

  return (
    <Pressable style={styles.screen} onPress={flapBird}>
      <View style={styles.hud}>
        <Text style={styles.title}>Feather Dash</Text>

        <Text style={styles.instructions}>
          {gameOver
            ? "Game Over! Press Spacebar to restart."
            : "Press Spacebar to flap!"}
        </Text>

        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.flaps}>Flaps: {flapCount}</Text>
      </View>

      {/* Temporary bird. Later we can replace this with an image. */}
      <View style={[styles.bird, { top: birdY }]}>
        <Text style={styles.birdText}>🐦</Text>
      </View>

      {/* Top pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: pipeX,
            top: 0,
            height: TOP_PIPE_HEIGHT,
          },
        ]}
      />

      {/* Bottom pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: pipeX,
            top: BOTTOM_PIPE_TOP,
            height: SCREEN_HEIGHT - BOTTOM_PIPE_TOP,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#87ceeb",
    alignItems: "center",
  },

  hud: {
    alignItems: "center",
    zIndex: 10,
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
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },

  flaps: {
    fontSize: 18,
    marginTop: 5,
  },

  bird: {
    position: "absolute",
    left: BIRD_LEFT,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    borderRadius: BIRD_SIZE / 2,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  birdText: {
    fontSize: 36,
  },

  pipe: {
    position: "absolute",
    width: PIPE_WIDTH,
    backgroundColor: "green",
    borderRadius: 10,
  },
});