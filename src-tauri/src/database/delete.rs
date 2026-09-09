use crate::state::AppState;
use rusqlite::params;
use tauri::Emitter;
use crate::models::tree::Tree;
use tauri::AppHandle;

#[tauri::command]
pub async fn delete_tree(tree_id: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

    conn.execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|e| e.to_string())?;

    tracing::info!("Deleting tree with ID: {}", tree_id);

    conn.execute("DELETE FROM trees WHERE id = ?1", params![&tree_id])
        .map_err(|e| {
            tracing::error!("Error deleting tree: {}", e);
            e.to_string()
        })?;

    Ok(())
}

#[tauri::command]
pub async fn delete_all_trees(state: tauri::State<'_, AppState>, app: AppHandle) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

    tracing::info!("Deleting all trees from the database");

    conn.execute("DELETE FROM trees", [])
        .map_err(|e| {
            tracing::error!("Error deleting all trees: {}", e);
            e.to_string()
        })?;

    app.emit("tree-changed", Option::<Tree>::None).map_err(|e| {
        tracing::error!("Error emitting tree-changed event: {}", e);
        e.to_string()
    })?;

    Ok(())
}