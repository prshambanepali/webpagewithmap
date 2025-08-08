const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() }); // ← store in memory first

app.post(
  "/upload",
  upload.fields([
    { name: "audio0", maxCount: 1 },
    { name: "audio1", maxCount: 1 },
    { name: "audio2", maxCount: 1 },
    { name: "audio3", maxCount: 1 },
    { name: "audio4", maxCount: 1 },
    { name: "audio5", maxCount: 1 },
    { name: "audio6", maxCount: 1 },
    { name: "audio7", maxCount: 1 },
    { name: "audio8", maxCount: 1 },
    { name: "audio9", maxCount: 1 },
    { name: "audio10", maxCount: 1 },
    { name: "consentAudio", maxCount: 1 },
  ]),
  (req, res) => {
    const recording = Object.keys(req.files)
      .filter((key) => key.startsWith("audio"))
      .sort(
        (a, b) =>
          parseInt(a.replace("audio", "")) - parseInt(b.replace("audio", ""))
      )
      .map((key) => req.files[key][0]); // Get the actual file object

    const consent = req.files.consentAudio[0];
    const paragraph = recording[0];
    const { age, province, district, gender } = req.body;

    if (
      !req.files ||
      !req.files?.consentAudio?.[0] ||
      !age ||
      !province ||
      !district ||
      !gender
    ) {
      return res.status(400).send("Missing fields");
    }

    //  Create folder uploads/ProvinceName if not exists
    const folderPath = path.join(__dirname, "uploads", province, district);
    fs.mkdirSync(folderPath, { recursive: true });

    const paragraphfolderPath = path.join(
      __dirname,
      "uploads",
      province,
      district,
      "paragraph"
    );
    fs.mkdirSync(paragraphfolderPath, { recursive: true });

    //  Create consent folder uploads/consents if not exists
    const consentfolderPath = path.join(
      __dirname,
      "uploads",
      "consents",
      province,
      district
    );
    fs.mkdirSync(consentfolderPath, { recursive: true });

    const fileindex = Date.now() + "-" + Math.floor(Math.random() * 1e6);
    let metadataEntry = {};
    //  Create unique filename for paragraph
    const paragraphfilename = fileindex + "-paragraph" + ".wav";
    const paragraphfilePath = path.join(paragraphfolderPath, paragraphfilename);
    fs.writeFileSync(paragraphfilePath, paragraph.buffer); // Save it to disk

    recording.forEach((file, index) => {
      if (index === 0) return; // Skip the first file as it's the paragraph

      const filename = fileindex + `-sentence${index}` + ".wav";
      fs.writeFileSync(path.join(folderPath, filename), file.buffer);
      metadataEntry[`sentence${index}`] = filename;
    });

    //  Create consent filename [consent-<filename>]
    const consentfilename = "consent-" + fileindex + ".wav";
    const consentfilePath = path.join(consentfolderPath, consentfilename);
    fs.writeFileSync(consentfilePath, consent.buffer); // ← save consent audio file

    //  Save metadata
    const metadataFile = "metadata.json";
    let metadata = [];

    try {
      if (fs.existsSync(metadataFile)) {
        const data = fs.readFileSync(metadataFile, "utf8");
        metadata = JSON.parse(data || "[]");
      }
    } catch (err) {
      console.error("Error reading metadata:", err);
    }

    const newCount = metadata.length + 1;

    const newEntry = {
      count: newCount,
      paragraphfilename,
      consentfilename,
      sentences: metadataEntry,
      age,
      gender,
      province,
      district,
      timestamp: new Date().toISOString(),
    };

    metadata.push(newEntry);
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    res.sendStatus(200);
  }
);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
