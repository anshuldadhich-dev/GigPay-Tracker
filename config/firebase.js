const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

let serviceAccount = null
let serviceAccountFile = null

try {
  const rootDir = path.join(__dirname, '..')
  const files = fs.readdirSync(rootDir)
  serviceAccountFile = files.find(file => 
    file === 'firebase-service-account.json' || 
    (file.startsWith('gigpay-tracker-firebase-adminsdk') && file.endsWith('.json'))
  )

  if (serviceAccountFile) {
    serviceAccount = require(path.join(rootDir, serviceAccountFile))
  }
} catch (e) {
  console.warn('Failed to scan for local firebase JSON file', e)
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  console.log(`✅ Loaded Firebase credentials locally from ${serviceAccountFile}`)
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production (Render) — environment variable se load karo
  try {
    const serviceAccountJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    })
    console.log('✅ Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT env var')
  } catch (err) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err)
  }
} else {
  console.warn('⚠️  Firebase credentials not found — Google login will not work')
}

module.exports = admin
