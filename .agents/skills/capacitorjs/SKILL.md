---
name: capacitorjs
description: "Use when developing this repository's Capacitor Android app, troubleshooting Next.js storefront builds in Capacitor, editing the mobile app configuration, or syncing/running/building the Android project. Follow official Capacitor documentation."
argument-hint: "Describe the Capacitor Android or storefront task and expected outcome"
user-invocable: true
disable-model-invocation: false
---

# Capacitor for SYA Store

Use this skill for the Capacitor Android shell and its Next.js storefront. Ground Android and Capacitor behavior in the official [Android documentation](https://capacitorjs.com/docs/android) and [configuration guide](https://capacitorjs.com/docs/android/configuration).

## Repository layout and constraints

- The Next.js storefront is in `storefront/`. The repository root is not a Next.js app; running its root `npm run build` can fail with "Couldn't find any `pages` or `app` directory."
- The native Android shell and its Capacitor CLI project are in `mobile/`. Run Capacitor CLI commands from that directory so they use the matching config and dependencies.
- Configure the Android app in `mobile/capacitor.config.json`; do not assume the root `capacitor.config.json` configures the Android project.
- The storefront is a server-rendered Next.js app with middleware and API routes. Do not add `output: "export"` or treat its build as a static Capacitor bundle without verifying that all server-dependent features have been replaced.
- The mobile project currently uses Capacitor 7 packages while root dependencies use Capacitor 8. Keep `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android` versions aligned within the app being built; do not mix the root and `mobile/` installations.
- `mobile/www/index.html` is only a placeholder. Local development loads the running storefront using `server.url` in the mobile config.

## Local Android development

1. Start the storefront from `storefront/`:

   ```powershell
   cd C:\path\to\syastore\storefront
   npm install
   npm run dev
   ```

   The storefront development server listens on port 3000.

2. In a second terminal, run Capacitor from `mobile/`:

   ```powershell
   cd C:\path\to\syastore\mobile
   npm install
   npx cap sync android
   npx cap run android
   ```

   The current emulator URL, `http://10.0.2.2:3000`, uses Android Emulator's host-loopback alias. For a physical device, use the development machine's reachable LAN address and ensure the server is accessible from that device.

3. Use Android Studio to inspect or run the native project:

   ```powershell
   npx cap open android
   ```

   Android development requires Android Studio and an Android API 24+ emulator or device. See the official [Android setup and run guide](https://capacitorjs.com/docs/android).

After changing Capacitor config or native dependencies, run `npx cap sync android` from `mobile/`. Use `npx cap doctor` there to diagnose the local toolchain.

## Storefront build troubleshooting

- Use `npm run build` from `storefront/` for the repository's managed build (it waits for the backend and invokes the storefront launcher).
- Use `npm run build:next` from `storefront/` only when intentionally building Next.js directly and its environment/backend prerequisites are available.
- The regular Android development loop does not require a storefront production build because the emulator loads the live development server.

## Production and release

- Do not ship a development `server.url`, LAN/localhost URL, or `cleartext: true` as a production configuration.
- The storefront depends on a Next.js server; a plain static export is not a drop-in production bundle. Before making a release build, choose and verify a production architecture that supports the storefront's server-side routes and middleware.
- Build and test the storefront and native Android app against that production architecture before distribution. Do not claim a successful native release from `npx cap build android` alone.
- Follow the official Android [configuration and permissions guide](https://capacitorjs.com/docs/android/configuration) for manifest changes, application ID, app name, deep links, and permissions. Check plugin documentation before adding native permissions.
