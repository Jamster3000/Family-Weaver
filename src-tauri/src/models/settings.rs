use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct SettingsFile {
	pub settings: Vec<Settings>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
	pub key: String, // stable identifier  (used as DB primary key)
	pub category: String, // which settings section this appears under
	pub name: String, // name of the setting
	pub short_description: String, // one line, shown next to the setting
	pub long_description: String, // a full description of what this is and does.
	pub search_terms: Vec<String>, // extra words a user might search for this
	pub value_type: ValueType, // Bool | Int | Float | Text | Enum([...]) | Action
	pub default: Option<Value>, // some(Value) for anything persisted, None for action
	pub min: Option<Value>, // optional bounds for Int/Float types
	pub max: Option<Value>, // optional bounds for Int/Float types
	pub value: Option<Value>, // the current value, not present in ron file
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValueType {
	Enum(Vec<String>),
	Bool,
	Int,
	Float,
	Action,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Value {
    Text(String),
    Bool(bool),
    Int(i64),
    Float(f64),
}