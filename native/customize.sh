#!/usr/bin/env bash
# Adjusts the generated Capacitor Android project: version, permissions, keep-awake plugin, icons.
set -euo pipefail
RUN="${GITHUB_RUN_NUMBER:-1}"
APP=android/app
SRC=$APP/src/main
JAVA=$SRC/java/com/tchawankon/piefit

# version shown in Android settings; versionCode must grow so new APKs install over old ones
sed -i -E "s/versionCode [0-9]+/versionCode $RUN/; s/versionName \"[^\"]*\"/versionName \"1.0.$RUN\"/" $APP/build.gradle

# exact alarms (rest timer on time), notifications, vibration
sed -i 's#</manifest>#    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />\n    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="32" />\n    <uses-permission android:name="android.permission.VIBRATE" />\n</manifest>#' $SRC/AndroidManifest.xml

cp native/KeepAwakePlugin.java native/MainActivity.java $JAVA/

# launcher icon: use the PieFit icon everywhere, drop the default adaptive icon
rm -rf $SRC/res/mipmap-anydpi-v26
for d in $SRC/res/mipmap-*; do
  cp icon-512.png "$d/ic_launcher.png"
  cp icon-512.png "$d/ic_launcher_round.png"
  [ -f "$d/ic_launcher_foreground.png" ] && cp icon-512.png "$d/ic_launcher_foreground.png"
done
echo "customized android project (versionCode $RUN)"
