use std::collections::HashSet;
use rusqlite::{Connection, params};
use crate::models::settings::{SettingsFile, Value, Settings};
use crate::state::AppState;

pub fn sync_settings(conn: &mut Connection) -> Result<(), Box<dyn std::error::Error>> {
	let ron_str = include_str!("../settings.ron");
	let parsed_ron: SettingsFile = ron::from_str(ron_str)?;
	let ron_settings = parsed_ron.settings;

	// Fetch keys currently in the database
	let mut stmt = conn.prepare("SELECT key FROM settings")?;
	let db_keys: HashSet<String> = stmt
		.query_map([], |row| row.get(0))?
		.filter_map(Result::ok)
		.collect();

	drop(stmt);

	let tx = conn.transaction()?;

	let ron_keys: HashSet<&str> = ron_settings
		.iter()
		.map(|s| s.key.as_str())
		.collect();

	// Prepare statements
	let mut insert_stmt = tx.prepare(
		"INSERT INTO settings (
			key, category, name, short_description, long_description,
			search_terms, value_type, default_val, min_val, step_val, max_val, value
		) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
	)?;

	let mut update_stmt = tx.prepare(
		"UPDATE settings SET
			category = ?1,
			name = ?2,
			short_description = ?3,
			long_description = ?4,
			search_terms = ?5,
			value_type = ?6,
			default_val = ?7,
			min_val = ?8,
			step_val = ?9,
			max_val = ?10
		WHERE key = ?11",
	)?;

	let mut get_val_stmt = tx.prepare("SELECT value FROM settings WHERE key = ?1")?;
	let mut clamp_val_stmt = tx.prepare("UPDATE settings SET value = ?1 WHERE key = ?2")?;

	for setting in &ron_settings {
		let search_terms_json = serde_json::to_string(&setting.search_terms)?;
		let value_type_json = serde_json::to_string(&setting.value_type)?;
		let default_json = setting.default.as_ref().map(serde_json::to_string).transpose()?;
		let min_json = setting.min.as_ref().map(serde_json::to_string).transpose()?;
		let step_val = setting.step.as_ref().map(serde_json::to_string).transpose()?;
		let max_json = setting.max.as_ref().map(serde_json::to_string).transpose()?;

		if !db_keys.contains(&setting.key) {
			// If the settings table is empty or doesn't include the setting
			insert_stmt.execute(params![
				setting.key,
				setting.category,
				setting.name,
				setting.short_description,
				setting.long_description,
				search_terms_json,
				value_type_json,
				default_json,
				min_json,
				step_val,
				max_json,
				default_json,
			])?;
		} else {
			// update the metadata if the setting exists
			update_stmt.execute(params![
				setting.category,
				setting.name,
				setting.short_description,
				setting.long_description,
				search_terms_json,
				value_type_json,
				default_json,
				min_json,
				step_val,
				max_json,
				setting.key,
			])?;

			// Validate and clamp the existing value against new min/max
			//This covers the case where the user's value for a setting may exceed or be below the min/max value's
			//allowed for a setting after that setting has been changed.
			if let Some(val_str) = get_val_stmt.query_row([&setting.key], |r| r.get::<_, Option<String>>(0))? {
				if let Ok(current_val) = serde_json::from_str::<Value>(&val_str) {
					let min_num = setting.min.as_ref().and_then(extract_numeric);
					let max_num = setting.max.as_ref().and_then(extract_numeric);

					match current_val {
						Value::Int(n) => {
							let n_f64 = n as f64;
							let mut clamped = n;

							if let Some(min) = min_num {
								if n_f64 < min { clamped = min as i64; }
							}
							if let Some(max) = max_num {
								if n_f64 > max { clamped = max as i64; }
							}

							if clamped != n {
								let clamped_json = serde_json::to_string(&Value::Int(clamped))?;
								clamp_val_stmt.execute(params![clamped_json, setting.key])?;
							}
						}
						Value::Float(n) => {
							let mut clamped = n;

							if let Some(min) = min_num {
								if clamped < min { clamped = min; }
							}
							if let Some(max) = max_num {
								if clamped > max { clamped = max; }
							}

							if (clamped - n).abs() > f64::EPSILON {
								let clamped_json = serde_json::to_string(&Value::Float(clamped))?;
								clamp_val_stmt.execute(params![clamped_json, setting.key])?;
							}
						}
						_ => {}//Values that aren't numerical don't need this clamping check, so they can be ignored.
					}
				}
			}
		}
	}

	drop(insert_stmt);
	drop(update_stmt);
	drop(get_val_stmt);
	drop(clamp_val_stmt);

	let mut delete_stmt = tx.prepare("DELETE FROM settings WHERE key = ?1")?;
	for db_key in &db_keys {
		if !ron_keys.contains(db_key.as_str()) {
			delete_stmt.execute([db_key])?;
		}
	}
	drop(delete_stmt);

	tx.commit()?;

	Ok(())
}

#[tauri::command]
pub async fn save_settings(
    settings: Vec<Settings>,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    {
        let mut stmt = tx
            .prepare("UPDATE settings SET value = ?1 WHERE key = ?2")
            .map_err(|e| e.to_string())?;

        for setting in settings {
            let val_str: Option<String> = match &setting.value {
                Some(v) => Some(serde_json::to_string(v).map_err(|e| e.to_string())?),
                None => None,
            };

            stmt.execute(params![val_str, setting.key])
                .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

fn extract_numeric(val: &Value) -> Option<f64> {
	match val {
		Value::Int(n) => Some(*n as f64),
		Value::Float(n) => Some(*n),
		_ => None,
	}
}