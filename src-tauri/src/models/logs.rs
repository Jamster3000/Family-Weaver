use serde::Serialize;
use std::sync::Mutex;

pub struct LogState(pub Mutex<Vec<LogEntry>>);

#[derive(Serialize, Clone)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub file: String,
    pub message: String,
    pub raw: String,
}

#[derive(Debug, Clone, Copy)]
pub enum LogLevel {
	Trace,
	Debug,
	Info,
	Warn,
	Error,
}

impl LogLevel {
	pub fn as_str(&self) -> &'static str {
		match self {
			LogLevel::Trace => "TRACE",
			LogLevel::Debug => "DEBUG",
			LogLevel::Info => "INFO",
			LogLevel::Warn => "WARN",
			LogLevel::Error => "ERROR",
		}
	}
}