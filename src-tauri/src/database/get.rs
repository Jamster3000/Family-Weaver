use crate::models::tree::Tree;
use crate::models::settings::{Settings, Value, ValueType};
use crate::state::AppState;
use rusqlite::OptionalExtension;
use serde::de::DeserializeOwned;
use crate::models::person::{MarriageDetails, Person, TimelineEntry};
use std::collections::HashMap;

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
#[tauri::command]
pub async fn get_all_people(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<Person>, String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

    tracing::info!("Fetching all people from the database");

    //Query for person table records
    let mut stmt = conn
        .prepare(
            "SELECT id, tree_id, first_name, middle_names, last_name, gender,
                    dob, birth_location, dod, death_location, important_notes
             FROM person
             WHERE tree_id = (SELECT id FROM trees WHERE active_tree = 1 LIMIT 1)",
        )
        .map_err(|e| {
            tracing::error!("Error preparing query for active tree people: {}", e);
            e.to_string()
        })?;

    let mut people_map: HashMap<String, Person> = stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            Ok((
                id.clone(),
                Person {
                    id,
                    tree_id: row.get(1)?,
                    first_name: row.get(2)?,
                    middle_names: row.get(3)?,
                    last_name: row.get(4)?,
                    gender: row.get(5)?,
                    dob: row.get(6)?,
                    birth_location: row.get(7)?,
                    dod: row.get(8)?,
                    death_location: row.get(9)?,
                    key_facts: None,
                    important_notes: row.get(10)?,
                    parent_ids: Vec::new(),
                    partner_ids: Vec::new(),
                    children_ids: Vec::new(),
                    marriages: HashMap::new(),
                    life_events: Vec::new(),
                    work_education: Vec::new(),
                    places_lived: Vec::new(),
                },
            ))
        })
        .map_err(|e| {
            tracing::error!("Error querying people table: {}", e);
            e.to_string()
        })?
        .collect::<Result<HashMap<_, _>, _>>()
        .map_err(|e| {
            tracing::error!("Error mapping people rows: {}", e);
            e.to_string()
        })?;

    //get the parents ids for each person and populate the parent_ids field
    let mut parents_stmt = conn
        .prepare("SELECT person_id, parent_id FROM person_parents")
        .map_err(|e| e.to_string())?;
    let parent_rows = parents_stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?;

    for row in parent_rows.flatten() {
        if let Some(person) = people_map.get_mut(&row.0) {
            person.parent_ids.push(row.1);
        }
    }

    // get the partner ids for each person and populate the partner_ids field
    let mut partners_stmt = conn
        .prepare("SELECT person_id, partner_id FROM person_partners")
        .map_err(|e| e.to_string())?;
    let partner_rows = partners_stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?;

    for row in partner_rows.flatten() {
        if let Some(person) = people_map.get_mut(&row.0) {
            person.partner_ids.push(row.1);
        }
    }

    // get the children ids for each person and populate the children_ids field
    let mut children_stmt = conn
        .prepare("SELECT person_id, child_id FROM person_children")
        .map_err(|e| e.to_string())?;
    let child_rows = children_stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?;

    for row in child_rows.flatten() {
        if let Some(person) = people_map.get_mut(&row.0) {
            person.children_ids.push(row.1);
        }
    }

    // Get the marriage details for each person and populate the marriages field
    let mut marriages_stmt = conn
        .prepare(
            "SELECT person_id, partner_id, marriage_date, marriage_location, divorce_date, divorce_location
             FROM marriages",
        )
        .map_err(|e| e.to_string())?;

    let marriage_rows = marriages_stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                MarriageDetails {
                    marriage_date: row.get(2)?,
                    marriage_location: row.get(3)?,
                    divorce_date: row.get(4)?,
                    divorce_location: row.get(5)?,
                },
            ))
        })
        .map_err(|e| e.to_string())?;

    for row in marriage_rows.flatten() {
        if let Some(person) = people_map.get_mut(&row.0) {
            person.marriages.insert(row.1, row.2);
        }
    }

    // get the timeline entries for each person and populate the appropriate fields
    let mut timeline_stmt = conn
        .prepare(
            "SELECT id, person_id, entry_type, title, description, start_date, end_date, location
             FROM timeline_entries",
        )
        .map_err(|e| e.to_string())?;

    let timeline_rows = timeline_stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(1)?, // person_id
                row.get::<_, String>(2)?, // entry_type
                TimelineEntry {
                    id: row.get(0)?,
                    title: row.get(3)?,
                    description: row.get(4)?,
                    start_date: row.get(5)?,
                    end_date: row.get(6)?,
                    location: row.get(7)?,
                },
            ))
        })
        .map_err(|e| e.to_string())?;

    for row in timeline_rows.flatten() {
        let (person_id, entry_type, entry) = row;
        if let Some(person) = people_map.get_mut(&person_id) {
            match entry_type.as_str() {
                "life_event" | "life_events" => person.life_events.push(entry),
                "work_education" => person.work_education.push(entry),
                "place_lived" | "places_lived" => person.places_lived.push(entry),
                _ => person.life_events.push(entry),
            }
        }
    }

    Ok(people_map.into_values().collect())
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