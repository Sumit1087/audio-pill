import React, { useEffect, useState } from "react";
import { PillSelector, Timeline } from "./components";
import { useAudio } from "./context";

import "./App.css";

let audioContext;
if ("AudioContext" in window || "webkitAudioContext" in window) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
} else {
  console.error("Web Audio API is not supported in this browser.");
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const { audioPills, setAudioPills, totalDuration } = useAudio();

  const playHandler = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      audioPills.forEach((file) => {
        const audioSource = audioContext.createBufferSource();

        fetch(file.path)
          .then((response) => response.arrayBuffer())
          .then((data) => audioContext.decodeAudioData(data))
          .then((decodedBuffer) => {
            audioSource.buffer = decodedBuffer;
            audioSource.connect(audioContext.destination);
            audioSource.start(audioContext.currentTime + file.startTime);
          })
          .catch((error) => console.error("Error loading audio file: ", error));
      });
    }
  };

  const resetHandler = () => {
    setAudioPills([]);
  }

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prevProgress) => prevProgress + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (progress > totalDuration) {
      setProgress(0);
      setIsPlaying(false)
    }
  }, [progress]);

  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = Math.floor(totalDuration % 60);
  const playedMinutes = Math.floor(progress / 60);
  const playedSeconds = Math.floor(progress % 60);

  return (
    <div className="appContainer">
      <h1 className="appTitle">Welcome to Audio Pill Player</h1>
      <PillSelector />
      <Timeline />
      {audioPills.length > 0 && (
        <div className="actionCenter">
          <div className="progressContainer">
            <div
              className="progressBar"
              style={{
                width: `${Math.round((progress * 100) / totalDuration)}%`,
              }}
            ></div>
          </div>
          <div className="buttonContainer">
            <button className="audioBtn" id="play-button" onClick={playHandler}>
              {isPlaying ? "Playing Audio..." : "Play"}
            </button>
            <div className="durationDisplay">
              <p>
                {playedMinutes.toString().padStart(2, "0")}:
                {playedSeconds.toString().padStart(2, "0")} /{" "}
                {totalMinutes.toString().padStart(2, "0")}:
                {totalSeconds.toString().padStart(2, "0")}
              </p>
            </div>
            {!isPlaying && (
              <button className="audioBtn" onClick={resetHandler}>
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;