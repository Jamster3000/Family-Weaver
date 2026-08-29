use std::path::PathBuf;
use tracing_subscriber::fmt::format::FmtSpan;

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
