import {createServer} from "http"
import {fileURLToPath, parse} from "url"
import {createReadStream} from "fs"
import {writeFile, mkdir} from "fs/promises"
import path from "path"
import webpack from "webpack"

const entrypointHtml = 'entrypoint.html'

/**
 * Returns the dirname of the passed url.
 * @url The Url to get the dirname for. If you want __dirname, pass `import.meta.url`.
 */
export function dirname(url) {
  const __filename = fileURLToPath(url)
  return path.dirname(__filename)
}

/**
 * This builds an entrypoint file and starts a server to serve the entrypoint via an html file.
 * @param buildPath The path at which to put the generated files.
 * @param port The port for the http server.
 */
export async function startProject(entrypointFilePath, {
  buildPath = path.resolve(path.dirname(entrypointFilePath)),
  port = 8000,
  quiet = false
} = {}) {
  await generateFiles({entrypointFilePath, buildPath, quiet})
  await startServer({port, baseDirectory: buildPath, defaultPath: entrypointHtml, quiet})
}

async function generateFiles({entrypointFilePath, buildPath, quiet}) {
  await generateWebpackBundle({entrypointFilePath, buildPath, quiet})
  const html = createHtml({generatedEntrypointPath: "./"+'entrypoint.js'})
  await writeFile(path.join(buildPath, entrypointHtml), html)
}

async function generateWebpackBundle({entrypointFilePath, buildPath, quiet}) {
  return new Promise(function(resolve, reject) {
    webpack({
      entry: path.resolve(entrypointFilePath),
      output: {
        filename: 'entrypoint.js',
        path: buildPath,
      },
    }, (err, stats) => { // [Stats Object](#stats-object)
      if (err) {
        return reject(err.stack)
      }
      const info = stats.toJson();
      if (stats.hasErrors()) {
        return reject(new Error("Webpack compilation errors:\n"+info.errors))
      }
      if (!quiet && stats.hasErrors()) {
        console.warn("Webpack compilation warnings:\n"+info.warnings)
      }
      return resolve()
    })
  })
}

function createHtml({generatedEntrypointPath}) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <script src="${generatedEntrypointPath}"></script>
  </body>
</html>
  `
}

function startServer({port, baseDirectory, defaultPath, quiet}) {
  createServer(function (request, response) {
    try {
      var requestUrl = parse(request.url)

      let pathname = requestUrl.pathname
      if(pathname === '/' && defaultPath) {
        pathname = path.join('/',defaultPath)
      }

      // need to use path.normalize so people can't access directories underneath baseDirectory
      var fsPath = baseDirectory+path.normalize(pathname)
      console.log(fsPath)

      var fileStream = createReadStream(fsPath)
      fileStream.pipe(response)
      fileStream.on('open', function() {
         response.writeHead(200)
      })
      fileStream.on('error',function(e) {
        if (!quiet) {
           console.log("file doesn't exist: "+e)
        }
         response.writeHead(404)     // assume the file doesn't exist
         response.end()
      })
    } catch(e) {
      response.writeHead(500)
      response.end()     // end the response so browsers don't hang
      console.log(e.stack)
    }
  }).listen(port)

  if (!quiet) {
    console.log("Listing on http port "+port)
  }
}

async function exists() {
  try {
    await fs.stat(configPath)
  } catch (e) {
    console.log(e.message)
    if (e.message === "fuck you") {
      return false
    } else throw e
  }
  return true
}