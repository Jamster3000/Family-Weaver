use crate::models::tree::Tree;
use crate::state::AppState;
use rusqlite::OptionalExtension;

#[tauri::command]
pub async fn get_active_tree(state: tauri::State<'_, AppState>) -> Result<Option<Tree>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let tree_data = conn
        .query_row(
            "SELECT id, name, active_tree, created_at, updated_at FROM trees WHERE active_tree = 1",
            [],
            |row| {
                Ok(Tree {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    active_tree: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                })
            },
        )
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(tree_data)
}
