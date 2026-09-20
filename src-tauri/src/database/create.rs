use crate::models::person::{Person, PersonValidator};
use crate::models::tree::Tree;
use crate::state::AppState;
use chrono::Utc;
use rusqlite::params;
use tauri::AppHandle;
use tauri::Emitter;

#[tauri::command]
pub async fn create_tree(
    tree: Tree,
    state: tauri::State<'_, AppState>,
    app: AppHandle,
) -> Result<Tree, String> {
    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Error locking database connection: {}", e);
        e.to_string()
    })?;

    let now = Utc::now().to_rfc3339();
    let tree_id = uuid::Uuid::new_v4().to_string();

    tracing::info!("Creating tree: {}", tree.name);

    conn.execute("UPDATE trees SET active_tree = 0", [])
        .map_err(|e| {
            tracing::error!("Failed to deactivate existing trees: {}", e);
            e.to_string()
        })?;

    conn.execute(
        "INSERT INTO trees (id, name, active_tree, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![&tree_id, &tree.name, &tree.active_tree, &now, &now],
    ).map_err(|e| {
        tracing::error!("Failed to create tree: {}", e);
        e.to_string()
    })?;

    let created_tree = Tree {
        id: tree_id,
        name: tree.name.clone(),
        active_tree: true,
        created_at: now.clone(),
        updated_at: now,
    };

    app.emit("tree-changed", &created_tree).ok();

    Ok(created_tree)
}

#[tauri::command]
pub async fn create_person(
    person: Person,
    state: tauri::State<'_, AppState>,
    app: AppHandle,
) -> Result<String, String> {
    let validator = PersonValidator::default();
    tracing::info!("Creating new person");

    // Validate the person data
    validator.validate(&person).map_err(|e| {
        tracing::error!("Person validation failed: {}", e);
        e.to_string()
    })?;

    let conn = state.conn.lock().map_err(|e| {
        tracing::error!("Failed to lock database connection: {}", e);
        e.to_string()
    })?;

    // Ensures that there's no stale bi-directional relationship data
    conn.execute("DELETE FROM person_parents WHERE person_id = ?1 OR parent_id = ?1", params![&person.id])
        .map_err(|e| {
            tracing::error!("Failed to delete old parent relationships: {}", e);
            e.to_string()
        })?;

    conn.execute("DELETE FROM person_partners WHERE person_id = ?1 OR partner_id = ?1", params![&person.id])
        .map_err(|e| {
            tracing::error!("Failed to delete old partner relationships: {}", e);
            e.to_string()
        })?;

    conn.execute("DELETE FROM person_children WHERE person_id = ?1 OR child_id = ?1", params![&person.id])
        .map_err(|e| {
            tracing::error!("Failed to delete old child relationships: {}", e);
            e.to_string()
        })?;

    conn.execute("DELETE FROM marriages WHERE person_id = ?1", params![&person.id])
        .map_err(|e| {
            tracing::error!("Failed to delete old marriages: {}", e);
            e.to_string()
        })?;

    conn.execute("DELETE FROM timeline_entries WHERE person_id = ?1", params![&person.id])
        .map_err(|e| {
            tracing::error!("Failed to delete old timeline entries: {}", e);
            e.to_string()
        })?;

    // Insert the person
    conn.execute(
        "INSERT INTO person (id, tree_id, first_name, middle_names, last_name, gender, dob, birth_location, dod, death_location, important_notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
         ON CONFLICT(id) DO UPDATE SET
            first_name = ?3,
            middle_names = ?4,
            last_name = ?5,
            gender = ?6,
            dob = ?7,
            birth_location = ?8,
            dod = ?9,
            death_location = ?10,
            important_notes = ?11,
            updated_at = ?13",
        params![
            &person.id,
            &person.tree_id,
            &person.first_name,
            &person.middle_names,
            &person.last_name,
            &person.gender,
            &person.dob,
            &person.birth_location,
            &person.dod,
            &person.death_location,
            &person.important_notes,
            Utc::now().to_rfc3339(),
            Utc::now().to_rfc3339()
        ],
    ).map_err(|e| {
        tracing::error!("Failed to upsert person: {}", e);
        e.to_string()
    })?;

    // Insert relationships (parents & reciprocal child)
    for parent_id in &person.parent_ids {
        conn.execute(
            "INSERT OR IGNORE INTO person_parents (person_id, parent_id) VALUES (?1, ?2)",
            params![&person.id, parent_id],
        )
        .map_err(|e| {
            tracing::error!("Failed to insert parent relationship: {}", e);
            e.to_string()
        })?;

        conn.execute(
            "INSERT OR IGNORE INTO person_children (person_id, child_id) VALUES (?1, ?2)",
            params![parent_id, &person.id],
        )
        .map_err(|e| {
            tracing::error!("Failed to insert reciprocal child relationship: {}", e);
            e.to_string()
        })?;
    }

    // Insert relationships (partners & reciprocal partner)
    for partner_id in &person.partner_ids {
        conn.execute(
            "INSERT OR IGNORE INTO person_partners (person_id, partner_id) VALUES (?1, ?2)",
            params![&person.id, partner_id],
        )
        .map_err(|e| {
            tracing::error!("Failed to insert partner relationship: {}", e);
            e.to_string()
        })?;

        conn.execute(
            "INSERT OR IGNORE INTO person_partners (person_id, partner_id) VALUES (?1, ?2)",
            params![partner_id, &person.id],
        )
        .map_err(|e| {
            tracing::error!("Failed to insert reciprocal partner relationship: {}", e);
            e.to_string()
        })?;
    }

    // Insert relationships (children & reciprocal parent)
    for child_id in &person.children_ids {
        conn.execute(
            "INSERT OR IGNORE INTO person_children (person_id, child_id) VALUES (?1, ?2)",
            params![&person.id, child_id],
        )
        .map_err(|e| {
            tracing::error!("Failed to insert child relationship: {}", e);
            e.to_string()
        })?;

        conn.execute(
            "INSERT OR IGNORE INTO person_parents (person_id, parent_id) VALUES (?1, ?2)",
            params![child_id, &person.id],
        )
        .map_err(|e| {
            tracing::error!("Failed to insert reciprocal parent relationship: {}", e);
            e.to_string()
        })?;
    }

    // Insert marriages
    for (partner_id, marriage) in &person.marriages {
        conn.execute(
            "INSERT INTO marriages (id, person_id, partner_id, marriage_date, marriage_location, divorce_date, divorce_location)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                uuid::Uuid::new_v4().to_string(),
                &person.id,
                partner_id,
                &marriage.marriage_date,
                &marriage.marriage_location,
                &marriage.divorce_date,
                &marriage.divorce_location
            ],
        ).map_err(|e| {
            tracing::error!("Failed to insert marriage: {}", e);
            e.to_string()
        })?;
    }

    // Insert timeline entries
    for event in &person.life_events {
        conn.execute(
            "INSERT INTO timeline_entries (id, person_id, entry_type, title, description, start_date, end_date, location)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                &event.id,
                &person.id,
                "life_event",
                &event.title,
                &event.description,
                &event.start_date,
                &event.end_date,
                &event.location
            ],
        ).map_err(|e| {
            tracing::error!("Failed to insert life event: {}", e);
            e.to_string()
        })?;
    }

    for event in &person.work_education {
        conn.execute(
            "INSERT INTO timeline_entries (id, person_id, entry_type, title, description, start_date, end_date, location)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                &event.id,
                &person.id,
                "work_education",
                &event.title,
                &event.description,
                &event.start_date,
                &event.end_date,
                &event.location
            ],
        ).map_err(|e| {
            tracing::error!("Failed to insert work/education event: {}", e);
            e.to_string()
        })?;
    }

    for event in &person.places_lived {
        conn.execute(
            "INSERT INTO timeline_entries (id, person_id, entry_type, title, description, start_date, end_date, location)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                &event.id,
                &person.id,
                "places_lived",
                &event.title,
                &event.description,
                &event.start_date,
                &event.end_date,
                &event.location
            ],
        ).map_err(|e| {
            tracing::error!("Failed to insert places lived event: {}", e);
            e.to_string()
        })?;
    }

    app.emit("tree-changed", String::new()).ok();

    Ok(person.id)
}