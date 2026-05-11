use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow};
                use cocoa::base::{id, nil, NO, YES};

                let window = app.get_webview_window("main").unwrap();
                let ns_window = window.ns_window().unwrap() as id;

                unsafe {
                    ns_window.setOpaque_(NO);
                    // Use clearColor instead of nil — nil defaults to white on macOS
                    ns_window.setBackgroundColor_(NSColor::clearColor(nil));
                    ns_window.setHasShadow_(YES);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
