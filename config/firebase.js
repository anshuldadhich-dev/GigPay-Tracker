const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json')

if (fs.existsSync(serviceAccountPath)) {
  // Local dev — JSON file se load karo
  const serviceAccount = require(serviceAccountPath)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production (Render) — environment variable se load karo
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
} else {
  console.warn('⚠️  Firebase credentials not found — Google login will not work')
}

module.exports = admin
