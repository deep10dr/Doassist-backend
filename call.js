const { exec } = require("child_process");
const path = require("path");

// Define the absolute path to transcribe.py
const scriptPath = path.join(__dirname, "transcribe.py"); // Adjust if needed

function transcribeAudio(callback) {
    exec(
        `python "${scriptPath}"`, // Ensure correct path
        { env: { ...process.env, PYTHONIOENCODING: "utf-8" } },
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return callback(error, null);
            }

            // Show only relevant errors
            if (stderr.trim() && !stderr.includes("VoskAPI")) {
                console.warn(`Warning: ${stderr}`);
            }

            console.log(`Transcription Output:\n${stdout.trim()}`);

            try {
                // Parse JSON output from Python script
                const result = JSON.parse(stdout.trim());
                callback(null, result);
            } catch (err) {
                callback(err, null);
            }
        }
    );
}

module.exports = transcribeAudio;
