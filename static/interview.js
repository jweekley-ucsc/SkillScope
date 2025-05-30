document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded fired.");

  const startBtn = document.getElementById("startRecordingBtn");
  const stopBtn = document.getElementById("stopRecordingBtn");
  const submitBtn = document.getElementById("submitTranscriptBtn");
  const transcriptBox = document.getElementById("transcriptPreview");
  const timer = document.getElementById("countdown");

  let mediaRecorder;
  let audioChunks = [];
  let timerInterval;

  function updateTimer(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    timer.textContent = `${mins}:${secs}`;
  }

  async function uploadRecording(blob) {
    if (!blob || blob.size === 0) {
      console.error("❌ No valid audio blob to upload.");
      alert("Recording failed or is empty.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", blob, "interview.webm");

    console.log("📤 Uploading audio... Blob size:", blob.size);
    try {
      const response = await fetch("http://127.0.0.1:5050/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }

      const result = await response.json();
      console.log("✅ Upload successful:", result);
      transcriptBox.textContent = JSON.stringify(result, null, 2);
      submitBtn.classList.remove("hidden");
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Failed to upload recording. See console for details.");
    }
  }

  startBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          console.log(`🎧 Captured chunk: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("🛑 Recording stopped. Total chunks:", audioChunks.length);

        if (audioChunks.length === 0) {
          console.error("❌ No audio chunks were recorded.");
          alert("Recording failed. No audio captured.");
          return;
        }

        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        console.log("📦 Blob ready for upload. Size:", audioBlob.size);
        uploadRecording(audioBlob);
        clearInterval(timerInterval);
        startBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
      };

      mediaRecorder.start();
      console.log("🎙️ Recording started.");
      startBtn.classList.add("hidden");
      stopBtn.classList.remove("hidden");

      updateTimer(3600);
      let remaining = 3600;
      timerInterval = setInterval(() => {
        remaining -= 1;
        updateTimer(remaining);
        if (remaining <= 0) {
          mediaRecorder.stop();
        }
      }, 1000);
    } catch (err) {
      console.error("🎤 Microphone access error:", err);
      alert("Microphone access is required to record.");
    }
  });

  stopBtn.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      console.log("🛑 Stop button clicked.");
    }
  });
});
