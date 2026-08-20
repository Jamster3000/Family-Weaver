use crate::models::release_information::{GithubRelease, ReleaseInfo};
use reqwest::header::USER_AGENT;

#[tauri::command]
pub async fn fetch_version_release(version: String) -> Result<ReleaseInfo, String> {
    let client = reqwest::Client::new();
    let tag = format!("v{}", version.trim_start_matches('v'));

    let url = format!("https://api.github.com/repos/Jamster3000/Family-Weaver/releases/tags/{}", tag);

    let res = client
        .get(&url)
        .header(USER_AGENT, "Family-Weaver-App")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("GitHub API error: {}", res.status()));
    }

    let release: GithubRelease = res.json().await.map_err(|e| e.to_string())?;

    Ok(ReleaseInfo {
        version: release.tag_name.trim_start_matches('v').to_string(),
        released_at: release.published_at,
        notes: release.body.unwrap_or_else(|| "No release notes available".to_string()),
        html_url: release.html_url,
    })
}