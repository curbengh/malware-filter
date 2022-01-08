'use strict'

// for deployment outside of GitLab CI, e.g. Cloudflare Pages and Netlify

const { stream: gotStream } = require('got')
const unzip = require('extract-zip')
const { join } = require('path')
const { mkdir, readdir, rm } = require('fs/promises')
const { createWriteStream } = require('fs')
const { pipeline } = require('stream/promises')

const rootPath = join(__dirname, '..')
const tmpPath = join(rootPath, 'tmp')
const zipPath = join(tmpPath, 'artifacts.zip')
const artifactsUrl = 'https://gitlab.com/curben/malware-filter/-/jobs/artifacts/main/download?job=pages'
const publicPath = join(rootPath, 'public')

const f = async () => {
  await mkdir(tmpPath, { recursive: true })

  console.log(`Downloading artifacts.zip from "${artifactsUrl}"`)
  await pipeline(
    gotStream(artifactsUrl),
    createWriteStream(zipPath)
  )

  console.log('Extracting artifacts.zip...')
  await unzip(zipPath, { dir: rootPath })

  const files = await readdir(publicPath)
  for (const file of files) {
    if (file.startsWith('oisd')) await rm(join(publicPath, file))
  }
}

f()
