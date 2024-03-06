import React from "react";
import { PillsData } from "../../common/constant";
import { useAudio } from "../../context";

import styles from "./PillSelector.module.css";

let audioContext;
if ("AudioContext" in window || "webkitAudioContext" in window) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
} else {
  console.error("Web Audio API is not supported in this browser. Please use another browser.");
}
const PillSelector = () => {
  const { setAudioPills } = useAudio();

  const pillClickHandler = (soundSource, soundName, soundColor) => {
    let duration;

    fetch(soundSource)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        audioContext
          .decodeAudioData(arrayBuffer, (buffer) => {
            duration = buffer.duration;

            setAudioPills((prevPills) => {
              const l = prevPills.length;

              const lastUpdatedDuration =
                l !== 0 ? prevPills[l - 1].duration : null;

              const lastUpdatedStartpoint =
                l !== 0 ? prevPills[l - 1].startTime : null;

              const newStartPoint = lastUpdatedDuration
                ? lastUpdatedDuration + lastUpdatedStartpoint
                : 0;
              return [
                ...prevPills,
                {
                  id: Math.random(),
                  audioName: soundName,
                  path: soundSource,
                  duration,
                  startTime: newStartPoint,
                  bgColor: soundColor,
                },
              ];
            });
          })
          .catch((error) => {
            console.error("Error decoding audio data:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching audio file:", error);
      });
  };

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.pillsContainer}>
        {PillsData.map(({ src, bgColor, name }) => (
          <button
            key={name}
            className={styles.selectorBtn}
            style={{ backgroundColor: bgColor }}
            onClick={() => pillClickHandler(src, name, bgColor)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PillSelector;
