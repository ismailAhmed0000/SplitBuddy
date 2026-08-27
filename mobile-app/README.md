SplitBuddy mobile — React Native CLI (TypeScript), bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

## Stack

- **Bare React Native 0.87** (not Expo) + **TypeScript** — native `android/`/`ios/` project folders are checked in and built directly via `react-native run-android`/`run-ios`.
- **NativeWind v4** (Tailwind for RN) — `tailwind.config.js`, `global.css`, wired into `babel.config.js` / `metro.config.js`. **Caveat learned the hard way:** `contentContainerClassName` does not reliably apply to `FlatList` in this setup — use a plain inline `contentContainerStyle={{ ... }}` object instead (see `GroupsListScreen.tsx`, `BuddiesScreen.tsx`, `BillsScreen.tsx` for the pattern). `className` on other components works fine.
- **Redux Toolkit + RTK Query** — `src/store/`. `authSlice` holds the session (token + user); `store/api/*.ts` (one file per domain — `authApi`, `usersApi`, `groupsApi`, `billsApi`, `settlementsApi`, `buddiesApi`, `notificationsApi`) inject endpoints onto a shared `baseApi` and talk to the same Laravel backend as `frontend/`. Screens import hooks from the barrel file `store/api/apiSlice.ts`.
- **AsyncStorage** — persists the auth token + user object across app restarts (`src/store/slices/authSlice.ts`, keys `splitbuddy_token` / `splitbuddy_user`). Any mutation that changes the logged-in user (e.g. `usersApi`'s `updateUser`) must also dispatch `userUpdated` **and** write through to `AsyncStorage` itself — RTK Query cache invalidation alone won't update the persisted copy.
- **React Navigation** (native-stack + bottom-tabs) — `src/navigation/RootNavigator.tsx` switches between the auth stack (Login/Register) and the app's bottom tabs (Home/Buddies/Bills) based on whether a session is hydrated. `HomeStack.tsx` nests Groups/Bills/Settings screens inside the Home tab.
- **react-native-svg** — every icon in `src/components/icons.tsx` and the `CollectorBadge`/`PaidStamp` seal graphics are hand-written `<Svg>` components, not an icon font/library.
- **Push notifications** — `@react-native-firebase/messaging` (transport) + `@notifee/react-native` (foreground display). See **Push notifications setup** below — this needs manual configuration before the app will even launch.
- **Jest + @testing-library/react-native** — `npm test`. See `src/store/slices/__tests__/authSlice.test.ts` and `src/screens/__tests__/LoginScreen.test.tsx` for the patterns in use.

## Features

- **Settings** (`SettingsScreen.tsx`, reached via the avatar button on Home) — edit profile fields and bank details (`bank_name`/`bank_account_number`, shown to buddies as "where to send money" — informational only, no payment processing), plus log out.
- **Groups** (`GroupsListScreen.tsx`, reached via the Groups card on Home) — each group's detail screen (`GroupDetailScreen.tsx`) has a Buddies/Bills tab toggle, a **Payer** section (creator picks one member as the group's "collector" via a modal), and a **Balances** list showing a green seal stamp (`CollectorBadge`/`PaidStamp`) for the collector/paid members, a greyed-out clickable stamp for a pending balance the viewer can act on (pay their own, or the collector marking someone else paid), and a plain "Pending" label otherwise.

## Verified

This has been built and run for real: `react-native run-android` (debug) on both the Android emulator and a physical USB-connected device, and as a standalone **release** build (`react-native run-android --mode release`) confirmed to keep working after Metro is killed and the USB cable is unplugged — release builds embed the JS bundle at build time, so they never depend on a live Metro connection. The release APK is signed with the default debug keystore (`android/app/build.gradle`) — fine for installing on your own device, but generate a real keystore before distributing it anywhere else.

iOS has not been run (no Xcode available in this environment) — `npx react-native bundle --platform ios ...` producing a working bundle is the strongest check done so far. To actually run it you still need, on a Mac with Xcode installed:

- `bundle install && bundle exec pod install` in `ios/`
- **Watchman** is recommended for either platform (`brew install watchman`) — Metro works without it but file-watching is slower.

## API configuration

`src/config/env.ts` is a single hardcoded `API_URL` constant (currently the production Railway URL) — there's no `__DEV__`/`Platform.OS` branching. For local backend development against an emulator/device:

- **Android emulator**: point it at `http://10.0.2.2:<port>/api` (the emulator's alias for the host machine) and run `adb reverse tcp:8081 tcp:8081` so the emulator can reach Metro too.
- **Physical device over USB**: same `adb reverse` trick works for port 8081, but the device can't resolve `10.0.2.2` or `localhost` on the host — use your machine's LAN IP instead (e.g. `http://192.168.1.23:8000/api`), with `php artisan serve --host=0.0.0.0`.
- Remember to point `API_URL` back at the real backend before committing — it's easy to leave it on a local IP by accident.

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
