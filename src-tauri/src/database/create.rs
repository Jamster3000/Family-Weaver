use crate::state::AppState;
use rusqlite::params;
use chrono::Utc;
use crate::models::tree::Tree;
use tauri::AppHandle;
use tauri::Emitter;

#[tauri::command]
pub async fn create_tree(tree: Tree, state: tauri::State<'_, AppState>, app: AppHandle) -> Result<String, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let tree_id = uuid::Uuid::new_v4().to_string();

    conn.execute("UPDATE trees SET active_tree = 0", [])
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO trees (id, name, active_tree, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![&tree_id, &tree.name, &tree.active_tree, &now, &now],
    ).map_err(|e| e.to_string())?;

    app.emit("tree-changed", serde_json::json!({ "name": tree.name })).ok();

    Ok(tree_id)
}