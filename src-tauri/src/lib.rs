use std::sync::{Arc, Mutex};
use tauri::Manager;

pub mod database;
pub mod models;
pub mod state;

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
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let conn = Arc::new(Mutex::new(
                database::initial::open(db_path.to_str().unwrap()).unwrap(),
            ));

            app.manage(state::AppState {
                conn,
                hwnd: 0.into(),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            database::create::create_tree,
            database::create::create_person,
            database::check::check_tree_exists,
            database::get::get_active_tree,
            database::get::get_all_trees,
            database::delete::delete_tree,
            database::set::set_new_active_tree,
            database::set::set_tree_name,
            database::set::switch_active_tree
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
