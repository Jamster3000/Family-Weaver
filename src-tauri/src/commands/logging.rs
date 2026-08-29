use tracing::{trace, debug, info, warn, error};

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