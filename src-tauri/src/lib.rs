use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::NSWindow;
                use cocoa::base::{id, nil, NO};

                let window = app.get_webview_window("main").unwrap();
                let ns_window = window.ns_window().unwrap() as id;

                unsafe {
                    ns_window.setOpaque_(NO);
                    ns_window.setBackgroundColor_(nil);
                    ns_window.setHasShadow_(true);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
