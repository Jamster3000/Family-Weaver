use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ReleaseInfo {
    pub version: String,
    pub released_at: String,
    pub notes: String,
    pub html_url: String,
}

#[derive(Deserialize)]
pub struct GithubRelease {
    pub tag_name: String,
    pub published_at: String,
    pub body: Option<String>,
    pub html_url: String,
}