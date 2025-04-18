const { exec } = require("child_process");

// Define the script path since both files are in the same folder
const scriptPath = "transcribe.py"; // No need for path.join

function transcribeAudio(callback) {
    exec(
        `python "${scriptPath}"`, // Call the Python script directly
        { env: { ...process.env, PYTHONIOENCODING: "utf-8" } },
        (error, stdout, stderr) => {
            if (error) {
                // Log the error and call the callback with the error
                console.error(`Error executing Python script: ${error.message}`);
                return callback(error, null);
            }

            // If there's stderr output, log only relevant warnings (excluding "VoskAPI" related warnings)
            if (stderr.trim() && !stderr.includes("VoskAPI")) {
                console.warn(`Warning from Python script: ${stderr.trim()}`);
            }

            // Only log stdout in case of success, not redundant logs
            if (stdout.trim()) {
                try {
                    // Parse JSON output from Python script
                    const result = JSON.parse(stdout.trim());
                    callback(null, result);
                } catch (err) {
                    // Handle JSON parsing error
                    console.error("Error parsing JSON output from Python script:", err);
                    callback(err, null);
                }
            } else {
                // If there's no output, handle accordingly (e.g., empty transcription)
                callback(new Error("No transcription output from Python script"), null);
            }
        }
    );
}

module.exports = transcribeAudio;
