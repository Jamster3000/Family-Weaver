use crate::state::AppState;

#[tauri::command]
pub async fn get_active_tree_name(state: tauri::State<'_, AppState>) -> Result<String, String> {
	let conn = state.conn.lock().map_err(|e| e.to_string())?;

	let name: String = conn.query_row(
		"SELECT name FROM trees WHERE active_tree = 1",
		[],
		|row| row.get(0),
	).map_err(|e| e.to_string())?;

	Ok(name)
}