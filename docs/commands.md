# Project Commands Guide

This document contains a list of important commands used in this project for development, formatting, and interacting with external services like Supabase. Since the project uses `bun`, we recommend using `bunx` instead of `npx`.

## 🧹 Code Quality (Linting & Formatting)

Ensure code consistency across the project.

| Command                   | Description                                                                                       |
| :------------------------ | :------------------------------------------------------------------------------------------------ |
| `bunx prettier --write .` | Formats all supported files in the project using Prettier.                                        |
| `bun run lint`            | Runs ESLint to find issues in your code, and Prettier to check formatting.                        |
| `bun run format`          | Automatically fixes ESLint issues and formats all files using Prettier (defined in package.json). |

## 🚀 Development Server

Commands to start and manage your Expo frontend.

| Command              | Description                                                                                                                                      |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `bunx expo start`    | Starts the Expo development server.                                                                                                              |
| `bunx expo start -c` | Starts the server and **clears the bundler cache**. Very useful when Tailwind/Nativewind classes aren't updating or when upgrading dependencies. |
| `bun run android`    | Starts the app directly in an Android emulator or connected device.                                                                              |
| `bun run ios`        | Starts the app directly in an iOS simulator (Requires macOS).                                                                                    |

## 🗄️ Supabase

Commands for interacting with your Supabase database.

| Command                                                                                     | Description                                                                                                                                                                                                                |
| :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bunx supabase login`                                                                       | Authenticates your local CLI with your Supabase account.                                                                                                                                                                   |
| `bunx supabase init`                                                                        | Initializes a new local Supabase project configuration if you haven't already.                                                                                                                                             |
| `bunx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/supabase.ts` | **Fetches TypeScript definitions** from your remote Supabase database and saves them to `src/types/supabase.ts`. Replace `<YOUR_PROJECT_ID>` with your actual project reference ID (found in your Supabase dashboard URL). |
| `bunx supabase gen types typescript --local > src/types/supabase.ts`                        | Generates types based on your **local** Supabase schema instead of the remote database.                                                                                                                                    |

## 📦 Dependencies

| Command                       | Description                                                                                                           |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `bun install`                 | Installs all dependencies declared in `package.json`.                                                                 |
| `bunx expo install <package>` | The recommended way to install an Expo-compatible package safely to ensure version compatibility.                     |
| `bunx expo prebuild --clean`  | Regenerates the underlying native `/android` and `/ios` directories from scratch. Helpful when native modules act up. |
