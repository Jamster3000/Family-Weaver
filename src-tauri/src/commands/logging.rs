use tracing::{trace, debug, info, warn, error};
use crate::logging::get_log_directory;
use crate::logging::parse_line;
use crate::models::logs::{LogEntry, LogState};
use tauri::State;

#[tauri::command]
pub fn log_message(level: String, message: String, module: String) -> Result<(), String> {
    let level = level.to_uppercase();
    let prefixed_message = format!("[{}] {}", module, message);

    match level.as_str() {
        "TRACE" => trace!("{}", prefixed_message),
        "DEBUG" => debug!("{}", prefixed_message),
        "INFO" => info!("{}", prefixed_message),
        "WARN" => warn!("{}", prefixed_message),
        "ERROR" => error!("{}", prefixed_message),
        _ => info!("{}", prefixed_message),
    }

    Ok(())
}

#[tauri::command]
pub async fn load_log_file(
    date: String,
    log_level: String,
    state: State<'_, LogState>,
) -> Result<usize, String> {
    let entries = tokio::task::spawn_blocking(move || -> Result<Vec<LogEntry>, String> {
        let log_dir = crate::logging::get_log_directory()?;
        let log_path = log_dir.join(format!("family-weaver.log.{}", date));

        tracing::info!("Loading '{}' log file", date);

        if !log_path.exists() {
            return Ok(Vec::new());
        }

        let content = std::fs::read_to_string(&log_path)
            .map_err(|e| format!("Failed to read file: {}", e))?;

        let parsed: Vec<LogEntry> = content
            .lines()
            .filter(|l| !l.trim().is_empty())
            .map(parse_line)
            .filter(|entry| {
                if log_level == "ALL" {
                    true
                } else {
                    entry.level.eq_ignore_ascii_case(&log_level)
                }
            })
            .collect();

        Ok(parsed)
    })
    .await
    .map_err(|e| {
        tracing::error!("Task execution failed: {}", e);
        format!("Task execution failed: {}", e)
    })??;

    let count = entries.len();
    let mut lock = state.0.lock().map_err(|_| {
        tracing::error!("Dailed to lock state");
        "Failed to lock state"
    })?;
    *lock = entries;

    Ok(count)
}

#[tauri::command]
pub fn get_log_chunk(
    offset: usize,
    limit: usize,
    state: State<'_, LogState>,
) -> Result<Vec<LogEntry>, String> {
    let lock = state.0.lock().map_err(|_| {
        tracing::error!("Failed to lock state");
        "Failed to lock state"
    })?;

    if offset >= lock.len() {
        return Ok(Vec::new());
    }

    let end = (offset + limit).min(lock.len());
    Ok(lock[offset..end].to_vec())
}

#[tauri::command]
pub async fn download_log_file(date: String) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        let log_dir = get_log_directory()?;
        let log_path = log_dir.join(format!("family-weaver.log.{}", date));

        tracing::info!("Preparing log '{}' to download", date);

        if !log_path.exists() {
            return Err(format!("Log file not found for date: {}", date));
        }

        let download_dir = dirs::download_dir()
            .ok_or("Could not determine downloads directory")?;

        let file_name = format!("family-weaver-{}.log", date);
        let download_path = download_dir.join(&file_name);

        std::fs::copy(&log_path, &download_path)
            .map_err(|e| format!("Failed to copy log file: {}", e))?;

        tracing::info!("Log file downloaded to: {}", download_path.display());

        Ok(())
    })
    .await
    .map_err(|e| format!("Task execution failed: {}", e))?
}