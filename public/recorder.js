function closePopup() {
  document.getElementById("popupNotice").style.display = "none";
  document.getElementById("popupConsent").style.display = "flex"; // Show consent popup
}
function closePopupS() {
  document.getElementById("popupSubmit").style.display = "none";
  location.reload();
}

let lastIndex = -1;
let lastIndexp = -1; // Initialize lastIndex to -1 to avoid repetition
let sentenceData = [];
let paragraphData = []; // Array to store paragraph data

function counter() {
  document.getElementById(
    "counter"
  ).innerText = `Audio recorded: ${recordings.length} of 11`;
}
function setRandomSentence() {
  counter();
  if (recordings.length == 0) {
    let randomIndexp;
    do {
      randomIndexp = Math.floor(Math.random() * paragraphData.length);
    } while (randomIndexp === lastIndexp);
    lastIndexp = randomIndexp; // Store last index to avoid repetition
    const randomParagraph = paragraphData[randomIndexp];
    document.getElementById("sentence").innerText = randomParagraph;
  } else {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * sentenceData.length);
    } while (randomIndex === lastIndex);
    lastIndex = randomIndex; // Store last index to avoid repetition
    const randomSentence = sentenceData[randomIndex];
    document.getElementById("sentence").innerText = randomSentence;
  }
}
Promise.all([
  fetch("paragraph.json").then((res) => res.json()),
  fetch("sentence.json").then((res) => res.json()),
])
  .then(([paragraph, sentences]) => {
    paragraphData = paragraph;
    sentenceData = sentences;
    setRandomSentence(); // Show first sentence (paragraph)
  })
  .catch((err) => {
    console.error("Error loading sentences:", err);
    document.getElementById("sentence").innerText = "Could not load sentence.";
  });

let consentRecorder;
let consentChunks = [];
let isconsentRecording = false;

const startConsentBtn = document.getElementById("startConsentBtn");
const stopConsentBtn = document.getElementById("stopConsentBtn");
const consentAudio = document.getElementById("consentAudio");
const consentContinueBtn = document.getElementById("consentContinueBtn");

startConsentBtn.addEventListener("click", async () => {
  if (!isconsentRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      consentRecorder = new MediaRecorder(stream);

      consentChunks = [];

      consentAudio.src = "";
      consentAudio.style.display = "none";

      consentContinueBtn.disabled = true; // Disable continue button
      consentContinueBtn.classList.remove("enabled");

      consentRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          consentChunks.push(event.data);
        }
      };

      consentRecorder.onstop = async () => {
        const consentBlob = new Blob(consentChunks, {
          type: consentRecorder.mimeType,
        });

        // Decode the recorded audio
        const arrayBuffer = await consentBlob.arrayBuffer();
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to WAV using audiobuffer-to-wav
        const wavData = window.audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavData], { type: "audio/wav" });

        // Play the WAV file
        const wavUrl = URL.createObjectURL(wavBlob);
        consentAudio.src = wavUrl;
        consentAudio.style.display = "block";

        consentContinueBtn.disabled = false;
        consentContinueBtn.classList.add("enabled");
      };

      consentRecorder.start();
      startConsentBtn.textContent = "⏹️ Stop Recording";
      startConsentBtn.classList.add("recordings");
      isconsentRecording = true;
    } catch (err) {
      alert("Microphone permission denied or unavailable.");
    }
  } else {
    consentRecorder.stop();
    startConsentBtn.textContent = "🎙️ Re-record consent";
    startConsentBtn.classList.remove("recordings");
    isconsentRecording = false;
  }
});

// After consent, show instruction popup
consentContinueBtn.addEventListener("click", () => {
  document.getElementById("popupConsent").style.display = "none";
});

let isRecording = false;
let mediaRecorder;
let recordings = []; // Array to store recorded audio blobs
let audioChunks = [];

const startBtn = document.getElementById("recordButton");
const uploadBtn = document.getElementById("uploadButton");
const submitBtn = document.getElementById("submitButton");
const form = document.getElementById("voiceform");
const audioPlayback = document.getElementById("audioPlayback");

startBtn.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      audioChunks = [];

      audioPlayback.src = "";
      audioPlayback.style.display = "none";
      uploadBtn.disabled = true; // Disable upload button
      uploadBtn.classList.remove("enabled");

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, {
          type: mediaRecorder.mimeType,
        });

        // Decode the recorded audio
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to WAV using audiobuffer-to-wav
        const wavData = window.audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavData], { type: "audio/wav" });

        // Play the WAV file
        const audioUrl = URL.createObjectURL(wavBlob);
        audioPlayback.src = audioUrl;
        audioPlayback.style.display = "block";

        uploadBtn.disabled = false; // Enable upload button
        uploadBtn.classList.add("enabled");
      };

      mediaRecorder.start();
      startBtn.textContent = "⏹️ Stop Recording";
      startBtn.classList.add("recording");
      isRecording = true;
    } catch (err) {
      alert("Microphone permission denied or unavailable.");
    }
  } else {
    mediaRecorder.stop();
    startBtn.textContent = "🎙️ Restart Recording";
    startBtn.classList.remove("recording");
    isRecording = false;
  }
});

uploadBtn.addEventListener("click", async () => {
  uploadBtn.disabled = true;
  setTimeout(() => {
    sentence.classList.add("fade-out");
    setTimeout(() => {
      sentence.classList.remove("fade-out");
      sentence.classList.add("fade-in");
    }, 300);
  }, 500);

  audioPlayback.src = ""; // Reset audio playback
  audioPlayback.style.display = "none"; // Hide audio playback

  const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });

  // Decode the recorded audio
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Convert to WAV using audiobuffer-to-wav
  const wavData = window.audioBufferToWav(audioBuffer);
  const wavBlob = new Blob([wavData], { type: "audio/wav" });

  recordings.push(wavBlob);
  audioChunks = [];
  counter(); // Update the counter
  setRandomSentence(); // to change sentence

  if (recordings.length === 11) {
    startBtn.classList.add("disabled");
    startBtn.disabled = true; // Disable start button
    uploadBtn.disabled = true; // disable upload button
    uploadBtn.classList.remove("enabled");
    uploadBtn.classList.add("disabled");
    submitBtn.disabled = false; // Enable submit button
    submitBtn.classList.add("enabled");

    document.getElementById("sentence").innerText =
      "Thankyou for your participation! Please click on Submit Recording to complete the process.";
  }

  startBtn.textContent = "🎙️ Start Recording"; // Reset start button text
  uploadBtn.disabled = true; // disable upload button
  uploadBtn.classList.remove("enabled");
  uploadBtn.classList.add("disabled");
});

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const provinces = document.getElementById("province").value;
  const age = document.getElementById("age").value;
  const district = document.getElementById("district").value;
  const gender = document.getElementById("gender").value;

  const fields = [
    { id: "province", value: provinces },
    { id: "district", value: district },
    { id: "age", value: age },
    { id: "gender", value: gender },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    element.style.borderColor = field.value ? "" : "red"; // Set border color to red if empty
    element.style.borderWidth = field.value ? "" : "2px"; // Set border color to red if empty
  });

  const formData = new FormData();
  recordings.forEach((blob, index) => {
    formData.append(`audio${index}`, blob, `sentence${index}.wav`);
  });

  const consentBlob = new Blob(consentChunks, { type: mediaRecorder.mimeType });

  // Decode the recorded audio
  const arrayBuffer = await consentBlob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Convert to WAV using audiobuffer-to-wav
  const wavData = window.audioBufferToWav(audioBuffer);
  const wavBlob = new Blob([wavData], { type: "audio/wav" });
  formData.append("consentAudio", wavBlob, "consent.wav");

  formData.append("province", document.getElementById("province").value);
  formData.append("district", document.getElementById("district").value);
  formData.append("age", document.getElementById("age").value);
  formData.append("gender", document.getElementById("gender").value);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    document.getElementById("popupSubmit").style.display = "flex";

    form.reset();
    recordings = []; // Reset recordings array
    startBtn.textContent = "🎙️ Start Recording";

    document.getElementById("province").style.borderColor = ""; // Reset border color
    document.getElementById("district").style.borderColor = "";
    document.getElementById("age").style.borderColor = "";
    document.getElementById("gender").style.borderColor = "";

    audioPlayback.src = "";
    audioPlayback.style.display = "none";

    submitBtn.disabled = true; // Disable submit button
    submitBtn.classList.remove("enabled");
    setRandomSentence(); // to change sentence
    startBtn.classList.remove("disabled");
    startBtn.disabled = false; // Enable start button
  } else {
    console.log("Failed to upload audio. Please try again.");
  }
});

document.getElementById("province").addEventListener("change", function () {
  const province = this.value;
  const districtSelect = document.getElementById("district");

  // Clear previous options
  districtSelect.innerHTML = '<option value="">-- Select District --</option>';

  if (provinceDistrictMap[province]) {
    provinceDistrictMap[province].forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
});

const provinceDistrictMap = {
  Koshi: [
    "Bhojpur",
    "Dhankuta",
    "Ilam",
    "Jhapa",
    "Khotang",
    "Morang",
    "Okhaldhunga",
    "Panchthar",
    "Sankhuwasabha",
    "Solukhumbu",
    "Sunsari",
    "Taplejung",
    "Terhathum",
    "Udayapur",
  ],
  Madhesh: [
    "Bara",
    "Dhanusha",
    "Mahottari",
    "Parsa",
    "Rautahat",
    "Saptari",
    "Sarlahi",
    "Siraha",
  ],
  Bagmati: [
    "Bhaktapur",
    "Chitwan",
    "Dhading",
    "Dolakha",
    "Kathmandu",
    "Kavrepalanchok",
    "Lalitpur",
    "Makwanpur",
    "Nuwakot",
    "Ramechhap",
    "Rasuwa",
    "Sindhuli",
    "Sindhupalchok",
  ],
  Gandaki: [
    "Baglung",
    "Gorkha",
    "Kaski",
    "Lamjung",
    "Manang",
    "Mustang",
    "Myagdi",
    "Nawalpur",
    "Parbat",
    "Syangja",
    "Tanahun",
  ],
  Lumbini: [
    "Arghakhanchi",
    "Banke",
    "Bardiya",
    "Dang",
    "Eastern Rukum",
    "Gulmi",
    "Kapilvastu",
    "Parasi",
    "Palpa",
    "Pyuthan",
    "Rolpa",
    "Rupandehi",
  ],
  Karnali: [
    "Dailekh",
    "Dolpa",
    "Humla",
    "Jajarkot",
    "Jumla",
    "Kalikot",
    "Mugu",
    "Salyan",
    "Surkhet",
    "Western Rukum",
  ],
  Sudurpashchim: [
    "Achham",
    "Baitadi",
    "Bajhang",
    "Bajura",
    "Dadeldhura",
    "Darchula",
    "Doti",
    "Kailali",
    "Kanchanpur",
  ],
};
