const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

document.getElementById("sliceBtn").onclick = async () => {
  const videoFile = document.getElementById("videoInput").files[0];
  const seconds = parseInt(document.getElementById("seconds").value);
  const resultBox = document.getElementById("result");

  if (!videoFile || !seconds) {
    alert("Upload a video and enter seconds!");
    return;
  }

  resultBox.innerHTML = "Processing... ⏳ This may take a while";

  await ffmpeg.load();
  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoFile));

  // Detect actual duration of video
  await ffmpeg.run("-i", "input.mp4");

  // Use ffprobe to get duration
  const ffprobeOutput = ffmpeg.FS("readFile", "ffmpeg.log")?.toString() || "";
  let duration = 0;
  const match = ffprobeOutput.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    duration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
  } else {
    duration = videoFile.duration || 60; // fallback 60s
  }

  const parts = Math.ceil(duration / seconds);

  let html = "<h3>Download Clips</h3>";

  for (let i = 0; i < parts; i++) {
    const start = i * seconds;
    const output = `out${i}.mp4`;

    await ffmpeg.run(
      "-i", "input.mp4",
      "-ss", `${start}`,
      "-t", `${seconds}`,
      "-c", "copy",
      output
    );

    const data = ffmpeg.FS("readFile", output);
    const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

    html += `<a href="${url}" download="clip${i+1}.mp4">Download Clip ${i+1}</a><br>`;
  }

  resultBox.innerHTML = html;
};
