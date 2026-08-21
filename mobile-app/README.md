SplitBuddy mobile — React Native CLI (TypeScript), bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

## Stack

- **NativeWind v4** (Tailwind for RN) — `tailwind.config.js`, `global.css`, wired into `babel.config.js` / `metro.config.js`.
- **Redux Toolkit + RTK Query** — `src/store/`. `authSlice` holds the session, `api/apiSlice.ts` talks to the Laravel backend (same API as `frontend/`).
- **AsyncStorage** — persists the auth token + user across app restarts (`src/store/slices/authSlice.ts`).
- **React Navigation** (native-stack) — `src/navigation/RootNavigator.tsx` switches between the auth stack (Login/Register) and app stack (Home) based on whether a session is hydrated.
- **Push notifications** — `@react-native-firebase/messaging` (transport) + `@notifee/react-native` (foreground display). See **Push notifications setup** below — this needs manual configuration before the app will even launch.
- **Jest + @testing-library/react-native** — `npm test`. See `src/store/slices/__tests__/authSlice.test.ts` and `src/screens/__tests__/LoginScreen.test.tsx` for the patterns in use.

## Environment this was scaffolded in

This project was set up on a machine with **no Xcode and no Android SDK installed** — only Node, CocoaPods, and a JDK. Everything that doesn't need a simulator/device was verified directly:

- `npm test` — full Jest suite passes.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx react-native bundle --platform ios ...` and `--platform android ...` — both produce a working production JS bundle (this is the strongest check possible without Xcode/Android Studio; it exercises Metro, NativeWind's Tailwind compilation, and every dependency's module resolution).

**Nobody has run this on an actual simulator, emulator, or device yet.** Before that will work you still need, on whichever machine does the building:

- **iOS**: Xcode + `bundle install && bundle exec pod install` in `ios/` (CocoaPods is installed here, but there's no Xcode to run `pod install` against yet — no Xcode means no iOS platform SDKs for it to target).
- **Android**: Android Studio (or just the Android SDK + an emulator/device) with `ANDROID_HOME` set.
- **Watchman** is recommended (`brew install watchman`) — Metro works without it but file-watching is slower.

## API configuration

`src/config/env.ts` points at the Laravel backend in `backend-api/`. In dev it targets `http://localhost:8000/api` on iOS and `http://10.0.2.2:8000/api` on Android (the emulator's alias for the host machine). **A physical device can't reach either** — point `API_URL` at your machine's LAN IP instead (e.g. `http://192.168.1.23:8000/api`), and make sure `php artisan serve --host=0.0.0.0` is listening on more than just localhost.

## Push notifications setup

The JS side (permission requests, foreground display via notifee, token refresh, notification-tap routing) is fully wired in `src/services/pushNotifications.ts` and called from `HomeScreen`. What's **not** done, because it needs your own Firebase account and can't be scaffolded blind:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add an Android app (package name `com.splitbuddy.mobile`) and download `google-services.json` into `android/app/`.
3. Add an iOS app (bundle ID `com.splitbuddy.mobile`) and download `GoogleService-Info.plist` into `ios/SplitBuddy/` (add it to the Xcode project target).
4. Apply the Android Gradle plugin (not yet added to this repo — do this once you have `google-services.json`, otherwise the Android build fails outright looking for a file that doesn't exist):
   - `android/build.gradle`: add `classpath 'com.google.gms:google-services:4.4.2'` to the top-level `dependencies` block.
   - `android/app/build.gradle`: add `apply plugin: 'com.google.gms.google-services'` near the top.
5. iOS: in Xcode, enable the **Push Notifications** and **Background Modes → Remote notifications** capabilities on the app target, and upload an APNs auth key to the Firebase project (Project settings → Cloud Messaging → Apple app configuration). Requires an Apple Developer account.
6. Run `bundle exec pod install` in `ios/` after adding the plist (CocoaPods needs to pick up the new Firebase native dependencies).
7. There's currently no backend endpoint to receive device push tokens — `getFcmToken()` in `src/services/pushNotifications.ts` returns the token, but nothing sends it anywhere yet. Add a `device_tokens` table/endpoint on `backend-api` (similar shape to the existing `notifications` table) before wiring that up.

Until steps 1–4 are done, **the app will crash immediately on launch** — `index.js` calls `setBackgroundMessageHandler` unconditionally at import time, which is required by `@react-native-firebase/messaging` but needs the native Firebase config to exist.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
