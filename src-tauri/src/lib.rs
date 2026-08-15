use std::sync::{Arc, Mutex};
use tauri::Manager;

mod database;
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let exe_dir = std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf();

    let db_path = if cfg!(debug_assertions) {
        let root_dir = exe_dir.join("..").join("..").join("..");
        root_dir.join("family_weaver.db")
    } else {
        exe_dir.join("family_weaver.db")
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let conn = Arc::new(Mutex::new(
                database::initial::open(db_path.to_str().unwrap()).unwrap()
            ));

            app.manage(state::AppState {
                conn,
                hwnd: 0.into(),
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}