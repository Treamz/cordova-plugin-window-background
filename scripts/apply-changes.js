const PLUGIN_NAME = "cordova-plugin-window-background";

const V6 = "cordova-android@6";
const V9 = "cordova-android@9";

var FILE_PATHS = {};

FILE_PATHS[V6] = {
    "android.manifest": "platforms/android/AndroidManifest.xml",
    "android.styles": "platforms/android/res/values/cordova-plugin-window-background-styles.xml"
};

FILE_PATHS[V9] = {
    "android.manifest": "platforms/android/app/src/main/AndroidManifest.xml",
    "android.styles": "platforms/android/app/src/main/res/values/cordova-plugin-window-background-styles.xml"
};

var deferral, fs, path, platformVersion;

function log(message) {
    console.log(PLUGIN_NAME + ": " + message);
}

function onError(error) {
    log("ERROR: " + error);
    deferral.resolve();
}

function getCordovaAndroidVersion() {
    var cordovaVersion = require(path.resolve(process.cwd(), 'platforms/android/cordova/version'));

    if (parseInt(cordovaVersion.version) <= 6) {
        cordovaVersion = V6;
    } else {
        cordovaVersion = V9;
    }

    return cordovaVersion;
}

function run() {
    try {
        fs = require('fs');
        path = require('path');

        platformVersion = getCordovaAndroidVersion();

        var pk = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json')));
        var color = pk.cordova.plugins["cordova-plugin-window-background"].WINDOW_BACKGROUND_COLOR;

        var manifestPath = path.resolve(process.cwd(), FILE_PATHS[platformVersion]["android.manifest"]);
        var contents = fs.readFileSync(manifestPath).toString();
        fs.writeFileSync(manifestPath, contents.replace(/(android:theme="@[^=]+")()/g, 'android:theme="@style/AppTheme"'), 'utf8');

        var stylesPath = path.resolve(process.cwd(), FILE_PATHS[platformVersion]["android.styles"]);
        fs.writeFileSync(stylesPath, '<resources><style name="AppTheme" parent="@android:style/Theme.DeviceDefault.NoActionBar"><item name="android:windowBackground">@color/windowBackgroundColor</item></style><color name="windowBackgroundColor">' + color + '</color></resources>');

    } catch (e) {
        throw ("Error: " + e.toString());
    }

    deferral.resolve();
}

function attempt(fn) {
    return function () {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            onError("EXCEPTION: " + e.toString());
        }
    }
}

module.exports = function () {
    deferral = require('q').defer();
    attempt(run)();
    return deferral.promise;
};