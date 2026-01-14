# Cambridge Bins (Bin Collection App)

### Project overview

Cambridge Bins is a small Expo / React Native app that helps residents quickly find their bin collection schedule by postcode, then optionally schedule reminder notifications.

### Platforms

- **iOS** (simulator + device)

### Tech stack

- **Expo** + **React Native**
- **Expo Router** (file-based routing)
- **Gluestack UI** + **NativeWind/Tailwind** (UI + styling)
- **AsyncStorage** (persistence)
- **expo-notifications** (local scheduled reminders)
- **Firebase Analytics** (user behavior)
- **Sentry** (error monitoring)

### Architecture overview

High-level structure:

- **`app/`**: Expo Router routes + most app code
  - **`app/index.js`**: entry route that chooses initial screen based on stored address
  - **`app/_layout.js`**: global providers + navigation stack
  - **`app/address-screen.js`**: postcode search + address selection (first-run flow)
  - **`app/home-screen.js`**: displays upcoming collection dates + modals
  - **`app/components/`**: route-local UI components (e.g. modals, list etc)
  - **`app/hooks/`**: reusable logic (e.g. `useAddressSearch`)
  - **`app/utils/`**: analytics, helpers, notification scheduling, API URL builders
- **`components/ui/`**: Gluestack UI wrapper components used across the app
- **`assets/`**: icons/images/fonts

Main user flows:

- **First run**: `app/index.js` checks `AsyncStorage` for `"address"` → routes to `address-screen` if missing.
- **Select address**: user enters postcode → `useAddressSearch` calls the address search endpoint → user picks an address → app saves `"address"` and routes to `home-screen`.
- **Home screen**: app loads `"address"`, fetches upcoming bin collections, and renders them in a carousel.
- **Notifications**: user opens the notifications modal, toggles settings, and the app schedules reminders for upcoming collection dates.

### State management

There is **no global state library** (no Redux/Zustand). State is kept simple and local:

What goes where:

- **AsyncStorage**: small persisted user preferences / selection
  - `"address"`: the selected address object (`{ id, address }`)
  - `"settings"`: notification settings (day-before/day-of toggles + times + selected bin types)
- **In-memory state**: fetched collections, transient UI state, and error messages

### Data layer

Network calls are done via `fetch()`:

- **Address search**: `useAddressSearch` builds the URL via `app/utils/wasteCalendarApi.js`
- **Collection search**: `home-screen` builds the URL via `app/utils/wasteCalendarApi.js`

### Running locally

Install:

```bash
npm install
```

Start the dev server:

```bash
npm start
```

### Notes / Technical decisions

- **Routing**: Expo Router (file-based routing) keeps navigation aligned with the filesystem and reduces boilerplate.

- **Notifications**: `expo-notifications` is used for local scheduling. Permission prompts should be tested on a physical device, as simulator support is limited.

- **Analytics**: `app/utils/analytics.js` centralises analytics and error reporting, routing behavioural events to Firebase and errors to Sentry to ensure consistent event naming.

- **TypeScript**: This project is written in JavaScript. If extended further, I would migrate incrementally to TypeScript, starting with the API and state layers.

