import {defineConfig} from "vite";
import {getMapsOptimizers, getMapsScripts} from "wa-map-optimizer-vite";

const fs = require('fs')

const isDirectory = async (path: string) => {
  const stats = await fs.lstatSync(path)
  return stats.isDirectory()
}

const getAllFromDirectory = async (directoryName: string, wantedExtension: string | null = null) => {
  const fileList: { [p: string]: string } = {}
  const files = fs.readdirSync(directoryName)

  if (typeof files !== 'undefined') {
    for (let i = 0; i < files.length; i++) {
      const path = directoryName + '/' + files[i]
      if (await isDirectory(path)) {
        const filesFromDir = await getAllFromDirectory(directoryName + '/' + files[i], wantedExtension) as unknown as string
        const keys = Object.keys(filesFromDir)
        for (let j = 0; j < keys.length; j++) {
          fileList[keys[j]] = Object.values(filesFromDir)[j]
        }
      } else {
        const key = 'view_' + files[i].split('.')[0]
        const extension = files[i].split('.')[1]
        if (!wantedExtension || extension === wantedExtension) {
          fileList[key] = './' + path
        }
      }
    }
  }
  return fileList
}

export default defineConfig(async () => {
  console.log('ALL FROM DIR', await getAllFromDirectory('views', 'html'))
  console.log('ALL FROM DIR', getMapsScripts("./maps"))
  return {
    base: "./",
    build: {
      rollupOptions: {
        input: {
          index: "./index.html",
          ...(await getAllFromDirectory('views', 'html')),
          ...getMapsScripts("./maps"),
        },
      },
    },
    plugins: [...getMapsOptimizers(undefined, "./maps")],
    server: {
      host: "localhost",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      open: "/",
    },
  }
});
