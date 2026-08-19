use crate::state::AppState;
use rusqlite::params;

#[tauri::command]
pub async fn delete_tree(tree_id: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
	let conn = state.conn.lock().map_err(|e| e.to_string())?;

	conn.execute(
		"DELETE FROM trees WHERE id = ?1",
		params![&tree_id],
	).map_err(|e| e.to_string())?;

	Ok(())
}