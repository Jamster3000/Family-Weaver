use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

// ============================================================================
// Validation Constants (accessible dynamically)
// ============================================================================

pub struct ValidationLimits {
    pub first_name_max: usize,
    pub middle_names_max: usize,
    pub last_name_max: usize,
    pub location_max: usize,
    pub important_notes_max: usize,
}

impl Default for ValidationLimits {
    fn default() -> Self {
        Self {
            first_name_max: 25,
            middle_names_max: 75,
            last_name_max: 30,
            location_max: 100,
            important_notes_max: 500,
        }
    }
}

// ============================================================================
// Timeline Entry
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEntry {
    pub id: String,
    pub title: String,
    pub description: String,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub location: Option<String>,
}

impl TimelineEntry {
    pub fn new(title: String, description: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            description,
            start_date: None,
            end_date: None,
            location: None,
        }
    }
}

// ============================================================================
// Marriage Details
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarriageDetails {
    pub marriage_date: Option<String>,
    pub marriage_location: Option<String>,
    pub divorce_date: Option<String>,
    pub divorce_location: Option<String>,
}

impl Default for MarriageDetails {
    fn default() -> Self {
        Self {
            marriage_date: None,
            marriage_location: None,
            divorce_date: None,
            divorce_location: None,
        }
    }
}

// ============================================================================
// Person
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Person {
    pub id: String,
    pub tree_id: String,

    #[serde(rename = "firstName")]
    pub first_name: Option<String>,
    #[serde(rename = "middleNames")]
    pub middle_names: Option<String>,
    #[serde(rename = "lastName")]
    pub last_name: Option<String>,
    pub dob: Option<String>,
    #[serde(rename = "birthLocation")]
    pub birth_location: Option<String>,
    pub dod: Option<String>,
    #[serde(rename = "deathLocation")]
    pub death_location: Option<String>,
    #[serde(rename = "keyFacts")]
    pub key_facts: Option<String>,
    #[serde(rename = "importantNotes")]
    pub important_notes: Option<String>,

    // Relationships
    #[serde(rename = "parentIds")]
    pub parent_ids: Vec<String>,
    #[serde(rename = "partnerIds")]
    pub partner_ids: Vec<String>,
    #[serde(rename = "childrenIds")]
    pub children_ids: Vec<String>,
    pub marriages: HashMap<String, MarriageDetails>,

    // Timeline data
    #[serde(rename = "lifeEvents")]
    pub life_events: Vec<TimelineEntry>,
    #[serde(rename = "workEducation")]
    pub work_education: Vec<TimelineEntry>,
    #[serde(rename = "placesLived")]
    pub places_lived: Vec<TimelineEntry>,
}

impl Person {
    pub fn new(tree_id: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            tree_id,
            first_name: None,
            middle_names: None,
            last_name: None,
            dob: None,
            birth_location: None,
            dod: None,
            death_location: None,
            key_facts: None,
            important_notes: None,
            parent_ids: Vec::new(),
            partner_ids: Vec::new(),
            children_ids: Vec::new(),
            marriages: HashMap::new(),
            life_events: Vec::new(),
            work_education: Vec::new(),
            places_lived: Vec::new(),
        }
    }
}

// ============================================================================
// Validation Error
// ============================================================================

#[derive(Debug, Clone)]
pub enum ValidationError {
    FirstNameTooLong { max: usize },
    LastNameTooLong { max: usize },
    MiddleNamesTooLong { max: usize },
    BirthLocationTooLong { max: usize },
    DeathLocationTooLong { max: usize },
    ImportantNotesTooLong { max: usize },
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::FirstNameTooLong { max } => {
                write!(f, "First name must be {} characters or less", max)
            }
            Self::LastNameTooLong { max } => {
                write!(f, "Last name must be {} characters or less", max)
            }
            Self::MiddleNamesTooLong { max } => {
                write!(f, "Middle names must be {} characters or less", max)
            }
            Self::BirthLocationTooLong { max } => {
                write!(f, "Birth location must be {} characters or less", max)
            }
            Self::DeathLocationTooLong { max } => {
                write!(f, "Death location must be {} characters or less", max)
            }
            Self::ImportantNotesTooLong { max } => {
                write!(f, "Biography & important notes must be {} characters or less", max)
            }
        }
    }
}

impl std::error::Error for ValidationError {}

// ============================================================================
// Person Validator
// ============================================================================

pub struct PersonValidator {
    pub limits: ValidationLimits,
}

impl Default for PersonValidator {
    fn default() -> Self {
        Self {
            limits: ValidationLimits::default(),
        }
    }
}

impl PersonValidator {
    pub fn new(limits: ValidationLimits) -> Self {
        Self { limits }
    }

    pub fn validate(&self, person: &Person) -> Result<(), ValidationError> {
        // First Name Validation
        if let Some(name) = &person.first_name {
            if name.len() > self.limits.first_name_max {
                return Err(ValidationError::FirstNameTooLong {
                    max: self.limits.first_name_max,
                });
            }
        }

        // Last Name Validation
        if let Some(name) = &person.last_name {
            if name.len() > self.limits.last_name_max {
                return Err(ValidationError::LastNameTooLong {
                    max: self.limits.last_name_max,
                });
            }
        }

        // Middle Names Validation
        if let Some(names) = &person.middle_names {
            if names.len() > self.limits.middle_names_max {
                return Err(ValidationError::MiddleNamesTooLong {
                    max: self.limits.middle_names_max,
                });
            }
        }

        // Birth Location Validation
        if let Some(loc) = &person.birth_location {
            if loc.len() > self.limits.location_max {
                return Err(ValidationError::BirthLocationTooLong {
                    max: self.limits.location_max,
                });
            }
        }

        // Death Location Validation
        if let Some(loc) = &person.death_location {
            if loc.len() > self.limits.location_max {
                return Err(ValidationError::DeathLocationTooLong {
                    max: self.limits.location_max,
                });
            }
        }

        // Important Notes Validation
        if let Some(notes) = &person.important_notes {
            if notes.len() > self.limits.important_notes_max {
                return Err(ValidationError::ImportantNotesTooLong {
                    max: self.limits.important_notes_max,
                });
            }
        }

        Ok(())
    }
}