plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "hk.b1gongdak"
    compileSdk = 35
    defaultConfig {
        applicationId = "hk.b1gongdak"
        minSdk = 29
        targetSdk = 35
        versionCode = 1
        versionName = "0.1-offline-prototype"
    }
    buildTypes {
        release { isMinifyEnabled = false }
        debug { isMinifyEnabled = false }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    packaging { jniLibs { useLegacyPackaging = true } }
}

dependencies {
    // Official Google device-local inference runtime: NO CLOUD INFERENCE / NO PAID API.
    implementation("com.google.ai.edge.litertlm:litertlm-android:0.18.0")
}