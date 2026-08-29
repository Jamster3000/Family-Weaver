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