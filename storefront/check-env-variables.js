const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    description: "Set this to your backend publishable API key.",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      "\n🚫 Error: Missing required environment variables\n"
    )

    missingEnvs.forEach(function (env) {
      console.error(`  ${env.key}`)
      if (env.description) {
        console.error(`    ${env.description}\n`)
      }
    })

    console.error(
      "\nPlease set these variables in your .env file or environment before starting the application.\n"
    )

    process.exit(1)
  }
}

module.exports = checkEnvVariables
