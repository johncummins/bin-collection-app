# Firebase Analytics Setup Guide

## 🚀 **What We've Set Up**

You now have a **dual analytics system**:

- **Firebase Analytics** → User behavior (screen views, button clicks, user journeys)
- **Sentry** → Error monitoring, crash reporting, performance tracking

## 📱 **Firebase Analytics Setup**

### **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `cambridge-bins` (or whatever you prefer)
4. Enable Google Analytics
5. Choose Analytics account (create new if needed)

### **Step 2: Add Your App**

1. In Firebase Console, click **"Add app"**
2. Choose **React Native**
3. Register your app with:
   - **iOS Bundle ID**: `com.cummins.bin-collection-app`
   - **Android Package Name**: `com.cummins.bin-collection-app`
4. Download the config files:
   - **iOS**: `GoogleService-Info.plist`
   - **Android**: `google-services.json`

### **Step 3: Install Config Files**

**For iOS:**

1. Add `GoogleService-Info.plist` to `ios/bincollectionapp/`
2. Add to Xcode project (drag & drop)

**For Android:**

1. Add `google-services.json` to `android/app/`

### **Step 4: Update App Configuration**

Replace the import in your app files:

```javascript
// In app/_layout.js, change from:
import analytics from "./utils/analytics";

// To:
import analytics from "./utils/combinedAnalytics";
```

### **Step 5: Test Firebase Analytics**

1. **Run your app** in development mode
2. **Navigate around** (screen views will be tracked)
3. **Tap buttons** (user actions will be tracked)
4. **Check Firebase Console** → **Analytics** → **Events** (may take a few minutes)

## 📊 **What You'll See Where**

### **Firebase Analytics Dashboard:**

- **Events**: Screen views, button clicks, user journeys
- **Audiences**: User segments and behavior patterns
- **Funnels**: User flow through your app
- **Real-time**: Live user activity

### **Sentry Dashboard:**

- **Issues**: Errors and crashes with full context
- **Performance**: API response times, app performance
- **Releases**: App version health and stability
- **Breadcrumbs**: User actions leading up to errors

## 🎯 **Analytics Events Being Tracked**

### **Firebase Analytics (User Behavior):**

- `screen_view`: When users visit screens
- `user_action`: Button clicks and interactions
- `bin_collection_event`: Address selection, data loading
- `notification_event`: Notification setup and scheduling
- `api_call`: API usage patterns
- `app_lifecycle`: App start/stop events

### **Sentry (Error Monitoring):**

- `error_occurred`: All errors with context
- `api_call`: API performance and failures
- `performance_metric`: App performance measurements
- Breadcrumbs: User actions leading to errors

## 🔧 **Next Steps**

1. **Complete Firebase setup** (config files)
2. **Update imports** to use `combinedAnalytics`
3. **Test both systems** work correctly
4. **Deploy to production** and monitor both dashboards
5. **Set up alerts** in both Firebase and Sentry

## 🎉 **Benefits of This Setup**

- **Firebase**: Excellent user behavior analytics, funnels, audiences
- **Sentry**: Superior error monitoring, performance tracking, debugging
- **Combined**: Best of both worlds with proper separation of concerns
- **Privacy**: Anonymous tracking, no personal data collection

Your app now has **enterprise-level analytics and monitoring**! 🚀
