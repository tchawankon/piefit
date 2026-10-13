package com.tchawankon.piefit;

import android.view.WindowManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Keeps the screen on while a workout is open (Android's FLAG_KEEP_SCREEN_ON).
@CapacitorPlugin(name = "KeepAwake")
public class KeepAwakePlugin extends Plugin {
    @PluginMethod
    public void keepAwake(PluginCall call) {
        getActivity().runOnUiThread(() -> getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
        call.resolve();
    }

    @PluginMethod
    public void allowSleep(PluginCall call) {
        getActivity().runOnUiThread(() -> getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
        call.resolve();
    }
}
