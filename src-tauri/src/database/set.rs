use crate::models::tree::Tree;
use crate::state::AppState;
use tauri::AppHandle;
use tauri::Emitter;

#[tauri::command]
pub async fn set_new_active_tree(
    state: tauri::State<'_, AppState>,
    app: AppHandle,
) -> Result<Option<Tree>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE trees SET active_tree = 1 WHERE id = (SELECT id FROM trees ORDER BY created_at DESC LIMIT 1)",
        [],
    ).map_err(|e| e.to_string())?;

    let created_tree = conn.query_row(
        "SELECT id, name, active_tree, created_at, updated_at FROM trees WHERE active_tree = 1 LIMIT 1",
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
    );

    match created_tree {
        Ok(tree) => {
            let _ = app.emit("tree-changed", &tree);
            Ok(Some(tree))
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn set_tree_name(
    tree_name: String,
    state: tauri::State<'_, AppState>,
    app: AppHandle,
) -> Result<Option<Tree>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE trees SET name = ?1 WHERE active_tree = 1",
        [tree_name],
    ).map_err(|e| e.to_string())?;

    let updated_tree = conn.query_row(
        "SELECT id, name, active_tree, created_at, updated_at FROM trees WHERE active_tree = 1 LIMIT 1",
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
    );

    match updated_tree {
        Ok(tree) => {
            let _ = app.emit("tree-changed", &tree);
            Ok(Some(tree))
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}