use std::path::PathBuf;
use tracing_subscriber::fmt::format::FmtSpan;
use crate::models::logs::LogEntry;

pub fn init_logging(db_path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let log_dir = db_path
        .parent()
        .ok_or("Could not determine log directory")?
        .join("logs");

    std::fs::create_dir_all(&log_dir)?;

    let file_appender = tracing_appender::rolling::daily(&log_dir, "family-weaver.log");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    tracing_subscriber::fmt()
        .with_writer(non_blocking)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(true)
        .with_level(true)
        .with_thread_ids(true)
        .with_line_number(true)
        .with_file(true)
        .with_ansi(false)
        .init();

    tracing::info!("Logging initialized. Logs directory: {}", log_dir.display());

    std::mem::forget(_guard);

    Ok(())
}

pub fn get_log_directory() -> Result<PathBuf, String> {
    let app_dir = if cfg!(debug_assertions) {
        let exe_dir = std::env::current_exe()
            .map_err(|e| e.to_string())?
            .parent()
            .ok_or("Could not determine app directory")?
            .to_path_buf();

        let root_dir = exe_dir.join("..").join("..").join("..");
        root_dir.canonicalize()
            .map_err(|e| e.to_string())?
    } else {
        std::env::current_exe()
            .map_err(|e| e.to_string())?
            .parent()
            .ok_or("Could not determine app directory")?
            .to_path_buf()
    };

    Ok(app_dir.join("logs"))
}

pub fn parse_line(line: &str) -> LogEntry {
    //Regex was/is an option here but for really large files and it's overhead on CPU
    //I decided to go with a more manual approach to parsing the log lines.

    let mut rest = line.trim();

    // Extract timestamp
    let (timestamp, after_ts) = if rest.starts_with(|c: char| c.is_ascii_digit()) {
        if let Some((ts, remainder)) = rest.split_once(' ') {
            (ts, remainder.trim_start())
        } else {
            ("", rest)
        }
    } else {
        ("", rest)
    };
    rest = after_ts;

    // extract log level
    let (level, after_level) = if let Some((lvl_candidate, remainder)) = rest.split_once(' ') {
        match lvl_candidate.to_uppercase().as_str() {
            "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE" => (lvl_candidate, remainder.trim_start()),
            _ => ("INFO", rest),
        }
    } else {
        ("INFO", rest)
    };
    rest = after_level;

    if rest.starts_with("ThreadId(") {
        if let Some((_, remainder)) = rest.split_once(')') {
            rest = remainder.trim_start();
        }
    }

    // Locate source file
    let (file, message) = if let Some(src_idx) = rest.find("src\\").or_else(|| rest.find("src/")) {
        let src_segment = &rest[src_idx..];
        if let Some((loc, msg)) = src_segment.split_once(':') {
            if let Some((line_num, msg_body)) = msg.trim_start().split_once(' ') {
                let full_loc = format!("{}:{}", loc, line_num.trim_end_matches(':'));
                (full_loc, msg_body.trim())
            } else {
                (loc.to_string(), msg.trim())
            }
        } else {
            ("unknown".to_string(), rest)
        }
    } else {
        ("unknown".to_string(), rest)
    };

    LogEntry {
        timestamp: timestamp.to_string(),
        level: level.to_uppercase(),
        file,
        message: message.to_string(),
        raw: line.to_string(),
    }
}