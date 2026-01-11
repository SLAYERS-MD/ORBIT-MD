import { exec } from "child_process"

export function imageToSticker(input, output) {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${input} ${output}`, err => {
      if (err) reject(err)
      else resolve(output)
    })
  })
}

