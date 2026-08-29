use crate::state::AppState;

#[tauri::command]
pub async fn check_tree_exists(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

    tracing::info!("Checking if any trees exist in the database");

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM trees", [], |row| row.get(0))
        .map_err(|e| {
            tracing::error!("Error checking if tree exists: {}", e);
            e.to_string()
        })?;
    Ok(count > 0)
}
