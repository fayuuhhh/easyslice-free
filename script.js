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

  resultBox.innerHTML = "Processing... This may take time ⏳";

  await ffmpeg.load();
  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoFile));

  const duration = 60 * 5; // simple demo default 5 min max
  const parts = Math.floor(duration / seconds);

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

    html += `<a href="${url}" download="clip${i}.mp4">Download Clip ${i+1}</a><br>`;
  }

  resultBox.innerHTML = html;
};
