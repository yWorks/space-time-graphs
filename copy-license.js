/**
 * Copies the license.json file from the 'yfiles' dependency of the 'demos/package.json' file to the 'demos' directory.
 */

const fs = require('fs')
const path = require('path')
const demosDir = process.cwd()

const packageJson = require(path.join(demosDir, '/package.json'))
const yFilesTarFile =
  packageJson && packageJson.dependencies ? packageJson.dependencies.yfiles : null
const destDir = path.join(__dirname, 'src', 'assets', 'yfiles')

if (!yFilesTarFile) {
  console.log(
    `\nyFiles license was NOT copied because the 'yfiles' dependency was not detected.` +
      `\nPlease add your own yFiles license to the demo.`
  )
  return
}

const licenseFile = path.join(demosDir, path.dirname(yFilesTarFile), 'lib', 'license.json')
if (!fs.existsSync(licenseFile)) {
  console.log(
    `\nyFiles license was NOT copied from '${licenseFile}' because the file does not exist.` +
      `\nPlease add your own yFiles license to the demo.`
  )
  return
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir)
}

if (fs.existsSync(licenseFile)) {
  console.log(`\nUsing yFiles license from '${licenseFile}'.`)
  const licenseData = require(licenseFile)
  fs.writeFileSync(path.join(destDir, 'license.js'), `export default ${JSON.stringify(licenseData, null, 2)}`)
} else {
  console.log(
    `\nyFiles license was NOT copied from '${licenseFile}'.` +
    `\nPlease add your own yFiles license data to the demo.`
  )
}
