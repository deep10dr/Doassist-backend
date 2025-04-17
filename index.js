const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const transcribeAudio = require("./call");
const mongoose = require('mongoose');
const URL ='mongodb+srv://deepak:deepak@deepak.1gdkg.mongodb.net/docassist';
const routes = require('./Rotues/route');


const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(URL).then(
    console.log('connected')).catch((err)=>{
    console.log(err);
})

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "./sample.wav");

    fs.writeFile(filePath, req.file.buffer, (err) => {
        if (err) {
            console.error("Error saving file:", err);
            return res.status(500).json({ error: "Error saving file" });
        }
        res.send('ok')
        console.log("File saved as sample.wav");

        // Call Python transcription after saving the file
        transcribeAudio((error, result) => {
            if (error) {
                return res.status(500).json({ error: "Transcription failed" });
            }

            // Save result to a JSON file
            fs.writeFileSync("transcription.json", JSON.stringify(result, null, 2));
            res.json({ message: "File saved and transcribed", transcription: result });
        });
    });
});
app.use('/',routes)




app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
