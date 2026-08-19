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
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let tree_id = uuid::Uuid::new_v4().to_string();

    conn.execute("UPDATE trees SET active_tree = 0", [])
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO trees (id, name, active_tree, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![&tree_id, &tree.name, &tree.active_tree, &now, &now],
    ).map_err(|e| e.to_string())?;

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
) -> Result<String, String> {
    let validator = PersonValidator::default();

    // Validate the person data
    validator.validate(&person).map_err(|e| e.to_string())?;

    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Insert the person
    conn.execute(
        "INSERT INTO person (id, tree_id, first_name, middle_names, last_name, dob, birth_location, dod, death_location, important_notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            &person.id,
            &person.tree_id,
            &person.first_name,
            &person.middle_names,
            &person.last_name,
            &person.dob,
            &person.birth_location,
            &person.dod,
            &person.death_location,
            &person.important_notes,
            Utc::now().to_rfc3339(),
            Utc::now().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    // Insert relationships (parents)
    for parent_id in &person.parent_ids {
        conn.execute(
            "INSERT INTO person_parents (person_id, parent_id) VALUES (?1, ?2)",
            params![&person.id, parent_id],
        )
        .map_err(|e| e.to_string())?;
    }

    // Insert relationships (partners)
    for partner_id in &person.partner_ids {
        conn.execute(
            "INSERT INTO person_partners (person_id, partner_id) VALUES (?1, ?2)",
            params![&person.id, partner_id],
        )
        .map_err(|e| e.to_string())?;
    }

    // Insert relationships (children)
    for child_id in &person.children_ids {
        conn.execute(
            "INSERT INTO person_children (person_id, child_id) VALUES (?1, ?2)",
            params![&person.id, child_id],
        )
        .map_err(|e| e.to_string())?;
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
        ).map_err(|e| e.to_string())?;
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
        ).map_err(|e| e.to_string())?;
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
        ).map_err(|e| e.to_string())?;
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
        ).map_err(|e| e.to_string())?;
    }

    Ok(person.id)
}

/*
let validator = PersonValidator::default();
let person = Person::new("John".to_string(), "Doe".to_string(), "tree-123".to_string());

match validator.validate(&person) {
    Ok(()) => println!("Valid person"),
    Err(e) => eprintln!("Validation error: {}", e),
}
*/
