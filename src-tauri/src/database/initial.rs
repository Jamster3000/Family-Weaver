use rusqlite::{Connection, Result};

pub fn open(path: &str) -> Result<Connection> {
    let conn = Connection::open(path)?;

    conn.execute_batch("
        PRAGMA journal_mode=WAL;
        PRAGMA foreign_keys=ON;

        CREATE TABLE IF NOT EXISTS persons (
            id TEXT PRIMARY KEY,
            tree_id TEXT NOT NULL,
            first_name TEXT NOT NULL,
            middle_names TEXT DEFAULT '',
            last_name TEXT NOT NULL,
            dob DATETIME,
            birth_location TEXT DEFAULT '',
            dod DATETIME,
            death_location TEXT DEFAULT '',
            key_facts TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS person_parents (
            person_id TEXT NOT NULL,
            parent_id TEXT NOT NULL,
            PRIMARY KEY (person_id, parent_id),
            FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES persons(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS person_partners (
            person_id TEXT NOT NULL,
            partner_id TEXT NOT NULL,
            PRIMARY KEY (person_id, partner_id),
            FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
            FOREIGN KEY (partner_id) REFERENCES persons(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS person_children (
            person_id TEXT NOT NULL,
            child_id TEXT NOT NULL,
            PRIMARY KEY (person_id, child_id),
            FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
            FOREIGN KEY (child_id) REFERENCES persons(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS marriages (
            id TEXT PRIMARY KEY,
            person_id TEXT NOT NULL,
            partner_id TEXT NOT NULL,
            marriage_date DATETIME,
            marriage_location TEXT,
            divorce_date DATETIME,
            divorce_location TEXT,
            FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
            FOREIGN KEY (partner_id) REFERENCES persons(id) ON DELETE CASCADE,
            UNIQUE(person_id, partner_id)
        );

        CREATE TABLE IF NOT EXISTS timeline_entries (
            id TEXT PRIMARY KEY,
            person_id TEXT NOT NULL,
            entry_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            start_date DATETIME,
            end_date DATETIME,
            location TEXT,
            FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS trees (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_persons_tree_id ON persons(tree_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_entries_person_id ON timeline_entries(person_id);
        CREATE INDEX IF NOT EXISTS idx_marriages_person_id ON marriages(person_id);
        CREATE INDEX IF NOT EXISTS idx_person_parents_parent_id ON person_parents(parent_id);
        CREATE INDEX IF NOT EXISTS idx_person_children_child_id ON person_children(child_id);
    ")?;
    Ok(conn)
}