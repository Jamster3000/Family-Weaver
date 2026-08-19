use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tree {
    #[serde(default)]
    pub id: String,
    pub name: String,
    #[serde(rename = "active_tree")]
    pub active_tree: bool,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}