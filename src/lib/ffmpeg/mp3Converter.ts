import { FFmpeg } from "@ffmpeg/ffmpeg";

const readFromBlobOrFile = (blob: Blob | File): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const { result } = fileReader;
      if (result instanceof ArrayBuffer) {
        resolve(new Uint8Array(result));
      } else {
        resolve(new Uint8Array());
      }
    };
    fileReader.onerror = (event) => {
      reject(
        Error(
          `File could not be read! Code=${event?.target?.error?.code || -1}`
        )
      );
    };
    fileReader.readAsArrayBuffer(blob);
  });

const fetchFile = async (
  file?: string | File | Blob
): Promise<Uint8Array> => {
  let data: ArrayBuffer | number[];

  if (typeof file === "string") {
    /* From base64 format */
    if (/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(file)) {
      data = atob(file.split(",")[1])
        .split("")
        .map((c) => c.charCodeAt(0));
      /* From remote server/URL */
    } else {
      data = await (await fetch(file)).arrayBuffer();
    }
  } else if (file instanceof URL) {
    data = await (await fetch(file)).arrayBuffer();
  } else if (file instanceof File || file instanceof Blob) {
    data = await readFromBlobOrFile(file);
  } else {
    return new Uint8Array();
  }

  return new Uint8Array(data);
};

export async function convertWebmToMp3(
  ffmpeg: FFmpeg,
  webmBlob: Blob
): Promise<Blob> {
  const inputName = "input.webm";
  const outputName = "output.mp3";

  await ffmpeg.writeFile(inputName, await fetchFile(webmBlob));

  await ffmpeg.exec(["-i", inputName, outputName]);

  const outputData = await ffmpeg.readFile(outputName);
  const outputBlob = new Blob([outputData], { type: "audio/mpeg" });

  return outputBlob;
}

export function blobToBase64(blob: Blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
