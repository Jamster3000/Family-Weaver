use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tree {
    pub name: String,
    pub active_tree: bool,
}