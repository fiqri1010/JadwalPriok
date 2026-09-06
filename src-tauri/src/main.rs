// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        // Inisialisasi Plugin Single Instance: Mencegah aplikasi dibuka lebih dari 1 kali
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // Jika pengguna mencoba membuka aplikasi lagi, fokuskan jendela yang sudah aktif
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
