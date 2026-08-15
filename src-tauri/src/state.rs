use std::sync::atomic::AtomicIsize;

pub struct AppState {
    pub conn: std::sync::Arc<std::sync::Mutex<rusqlite::Connection>>,
    pub hwnd: AtomicIsize,
}

impl AppState {
    pub fn hwnd_set(&self, hwnd: isize) {
        self.hwnd.store(hwnd, std::sync::atomic::Ordering::Relaxed);
    }

    pub fn hwnd_get(&self) -> isize {
        self.hwnd.load(std::sync::atomic::Ordering::Relaxed)
    }
}