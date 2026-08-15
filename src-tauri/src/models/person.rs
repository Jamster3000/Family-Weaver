use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

//==========
// Person model and validation constraints
//==========

pub struct ValidationLimits {
    pub first_name_max: usize,
    pub middle_names_max: usize,
    pub last_name_max: usize,
    pub location_max: usize,
    pub key_facts_max: usize,
}

impl Default for ValidationLimits {
    fn default() -> Self {
        Self {
            first_name_max: 25,
            middle_names_max: 75,
            last_name_max: 30,
            location_max: 100,
            key_facts_max: 500,
        }
    }
}

//==========
// Timeline entry
//==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEntry {
    pub id: String,
    pub title: String,
    pub description: String,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
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

//==========
// Marriage details
//==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarriageDetails {
    pub marriage_date: Option<DateTime<Utc>>,
    pub marriage_location: Option<String>,
    pub divorce_date: Option<DateTime<Utc>>,
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

//==========
// Person model
//==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Person {
    pub id: String,
    pub tree_id: String,
    pub first_name: String,
    pub middle_names: String,
    pub last_name: String,
    pub dob: Option<DateTime<Utc>>,
    pub birth_location: String,
    pub dod: Option<DateTime<Utc>>,
    pub death_location: String,
    pub key_facts: String,

    // Relationships
    pub parent_ids: Vec<String>,
    pub partner_ids: Vec<String>,
    pub children_ids: Vec<String>,
    pub marriages: HashMap<String, MarriageDetails>,

    // Timeline data
    pub life_events: Vec<TimelineEntry>,
    pub work_education: Vec<TimelineEntry>,
    pub places_lived: Vec<TimelineEntry>,
}

impl Person {
    pub fn new(first_name: String, last_name: String, tree_id: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            tree_id,
            first_name,
            middle_names: String::new(),
            last_name,
            dob: None,
            birth_location: String::new(),
            dod: None,
            death_location: String::new(),
            key_facts: String::new(),
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

//==========
// Validation error
//==========

#[derive(Debug, Clone)]
pub enum ValidationError {
    FirstNameRequired,
    FirstNameTooLong { max: usize },
    LastNameRequired,
    LastNameTooLong { max: usize },
    MiddleNamesTooLong { max: usize },
    BirthLocationTooLong { max: usize },
    DeathLocationTooLong { max: usize },
    KeyFactsTooLong { max: usize },
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::FirstNameRequired => write!(f, "First name is required"),
            Self::FirstNameTooLong { max } => {
                write!(f, "First name must be {} characters or less", max)
            }
            Self::LastNameRequired => write!(f, "Last name is required"),
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
            Self::KeyFactsTooLong { max } => {
                write!(f, "Key facts must be {} characters or less", max)
            }
        }
    }
}

impl std::error::Error for ValidationError {}

//==========
// Person Validation
//==========

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
        if person.first_name.trim().is_empty() {
            return Err(ValidationError::FirstNameRequired);
        }

        if person.first_name.len() > self.limits.first_name_max {
            return Err(ValidationError::FirstNameTooLong {
                max: self.limits.first_name_max,
            });
        }

        if person.last_name.trim().is_empty() {
            return Err(ValidationError::LastNameRequired);
        }

        if person.last_name.len() > self.limits.last_name_max {
            return Err(ValidationError::LastNameTooLong {
                max: self.limits.last_name_max,
            });
        }

        if !person.middle_names.is_empty()
            && person.middle_names.len() > self.limits.middle_names_max
        {
            return Err(ValidationError::MiddleNamesTooLong {
                max: self.limits.middle_names_max,
            });
        }

        if !person.birth_location.is_empty()
            && person.birth_location.len() > self.limits.location_max
        {
            return Err(ValidationError::BirthLocationTooLong {
                max: self.limits.location_max,
            });
        }

        if !person.death_location.is_empty()
            && person.death_location.len() > self.limits.location_max
        {
            return Err(ValidationError::DeathLocationTooLong {
                max: self.limits.location_max,
            });
        }

        if !person.key_facts.is_empty() && person.key_facts.len() > self.limits.key_facts_max {
            return Err(ValidationError::KeyFactsTooLong {
                max: self.limits.key_facts_max,
            });
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_person() {
        let validator = PersonValidator::default();
        let person = Person::new("John".to_string(), "Doe".to_string(), "tree1".to_string());
        assert!(validator.validate(&person).is_ok());
    }

    #[test]
    fn test_missing_first_name() {
        let validator = PersonValidator::default();
        let mut person = Person::new("John".to_string(), "Doe".to_string(), "tree1".to_string());
        person.first_name = String::new();
        assert!(matches!(
            validator.validate(&person),
            Err(ValidationError::FirstNameRequired)
        ));
    }

    #[test]
    fn test_first_name_too_long() {
        let validator = PersonValidator::default();
        let mut person = Person::new("John".to_string(), "Doe".to_string(), "tree1".to_string());
        person.first_name = "a".repeat(26);
        assert!(matches!(
            validator.validate(&person),
            Err(ValidationError::FirstNameTooLong { max: 25 })
        ));
    }

    #[test]
    fn test_custom_limits() {
        let limits = ValidationLimits {
            first_name_max: 10,
            ..Default::default()
        };
        let validator = PersonValidator::new(limits);
        let mut person = Person::new("John".to_string(), "Doe".to_string(), "tree1".to_string());
        person.first_name = "a".repeat(11);
        assert!(matches!(
            validator.validate(&person),
            Err(ValidationError::FirstNameTooLong { max: 10 })
        ));
    }
}


/*
let validator = PersonValidator::default();
let person = Person::new("John".to_string(), "Doe".to_string(), "tree-123".to_string());

match validator.validate(&person) {
    Ok(()) => println!("Valid person"),
    Err(e) => eprintln!("Validation error: {}", e),
}
*/