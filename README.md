# Web Project Template

A simple module that takes the pain out of creating a small component-based web project. Certain kinds of things can't be easily done with plain html files - a server is needed to serve the files, a build process is needed to package modules together. I was tired of looking up how to do this every time I wanted to make a small test of some idea, so I created this. 

### How to use

In node.js:

```
import { startProject } from "web-project-template"

startProject("entrypoint.js")
```

**`startProject(entrypointFilePath, {buildPath, port, quiet})`** - Generates an html entrypoint file and runs a server to serve it. 

* `entrypointFilePath` 
* `buildPath` - *Default: `"./build"`*. The path where generated files will be put. 
* `port` - *Default: `8000`*. The port the server will run on. 
* `quiet` - *Default: `false`*. Set to true if you want to turn off internal console logs that display certain things.