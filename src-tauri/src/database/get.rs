use crate::models::tree::Tree;
use crate::models::settings::{Settings, Value, ValueType};
use crate::state::AppState;
use rusqlite::OptionalExtension;
use serde::de::DeserializeOwned;

#[tauri::command]
pub async fn get_active_tree(state: tauri::State<'_, AppState>) -> Result<Option<Tree>, String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

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
        .map_err(|e| {
            tracing::error!("Error querying active tree: {}", e);
            e.to_string()
        })?;

    Ok(tree_data)
}

#[tauri::command]
pub async fn get_all_trees(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<Tree>, String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

    tracing::info!("Fetching all trees from the database");

    let mut stmt = conn
        .prepare("SELECT id, name, active_tree, created_at, updated_at FROM trees")
        .map_err(|e| {
            tracing::error!("Error preparing query for all trees: {}", e);
            e.to_string()
        })?;

    let tree_iter = stmt
        .query_map([], |row| {
            Ok(Tree {
                id: row.get(0)?,
                name: row.get(1)?,
                active_tree: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| {
            tracing::error!("Error iterating over tree results: {}", e);
            e.to_string()
        })?;

    let mut trees = Vec::new();
    for tree in tree_iter {
        trees.push(tree.map_err(|e| {
            tracing::error!("Error mapping tree row: {}", e);
            e.to_string()
        })?);
    }
    Ok(trees)
}

#[tauri::command]
pub async fn get_all_settings(state: tauri::State<'_, AppState>) -> Result<Vec<Settings>, String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

    tracing::info!("Fetching all settings from the database");

    let mut stmt = conn
        .prepare(
            "SELECT
                key, category, name, short_description, long_description,
                search_terms, value_type, default_val, min_val, step_val, max_val, value
             FROM settings",
        )
        .map_err(|e| {
            tracing::error!("Error preparing query for all settings: {}", e);
            e.to_string()
        })?;

    let settings_rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, Option<String>>(7)?,
                row.get::<_, Option<String>>(8)?,
                row.get::<_, Option<String>>(9)?,
                row.get::<_, Option<String>>(10)?,
                row.get::<_, Option<String>>(11)?,
            ))
        })
        .map_err(|e| {
            tracing::error!("Error iterating over settings results: {}", e);
            e.to_string()
        })?;

    let mut settings = Vec::new();

    for row in settings_rows {
        let (
            key,
            category,
            name,
            short_description,
            long_description,
            search_terms_json,
            value_type_json,
            default_json,
            min_json,
            step_json,
            max_json,
            value_json,
        ) = row.map_err(|e| {
            tracing::error!("Error mapping settings row: {}", e);
            e.to_string()
        })?;

        let search_terms: Vec<String> = serde_json::from_str(&search_terms_json)
            .map_err(|e| {
                tracing::error!("Error parsing search_terms for key '{}': {}", key, e);
                format!("Error parsing search_terms for key '{}': {}", key, e)
            })?;

        let value_type: ValueType = serde_json::from_str(&value_type_json)
            .map_err(|e| {
                tracing::error!("Error parsing value_type for key '{}': {}", key, e);
                format!("Error parsing value_type for key '{}': {}", key, e)
            })?;

        let default: Option<Value> = parse_optional_json(default_json, "default_val", &key)?;
        let min: Option<Value> = parse_optional_json(min_json, "min_val", &key)?;
        let step: Option<Value> = parse_optional_json(step_json, "step_val", &key)?;
        let max: Option<Value> = parse_optional_json(max_json, "max_val", &key)?;
        let value: Option<Value> = parse_optional_json(value_json, "value", &key)?;

        settings.push(Settings {
            key,
            category,
            name,
            short_description,
            long_description,
            search_terms,
            value_type,
            default,
            min,
            step,
            max,
            value,
        });
    }

    Ok(settings)
}

fn parse_optional_json<T: DeserializeOwned>(
    json_str: Option<String>,
    field_name: &str,
    key: &str,
) -> Result<Option<T>, String> {
    match json_str {
        Some(s) if !s.trim().is_empty() => serde_json::from_str(&s)
            .map_err(|e| {
                tracing::error!("Failed to parse JSON for key '{}' in column '{}' (raw value: '{}'): {}", key, field_name, s, e);
                format!("Failed to parse JSON for key '{}' in column '{}' (raw value: '{}'): {}", key, field_name, s, e)
            }),
        _ => Ok(None),
    }
}