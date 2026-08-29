import { invoke } from "@tauri-apps/api/core";

export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";

class Logger {
    private moduleName: string;

    constructor(moduleName: string) {
        this.moduleName = moduleName;
    }

    private async log(level: LogLevel, message: string): Promise<void> {
        try {
            await invoke("log_message", {
                level,
                message,
                module: this.moduleName,
            });
        } catch (error) {
            console.error("Failed to log message:", error);
        }
    }

    trace(message: string): void {
        this.log("TRACE", message);
    }

    debug(message: string): void {
        this.log("DEBUG", message);
    }

    info(message: string): void {
        this.log("INFO", message);
    }

    warn(message: string): void {
        this.log("WARN", message);
    }

    error(message: string): void {
        this.log("ERROR", message);
    }
}

export function createLogger(moduleName: string): Logger {
    return new Logger(moduleName);
}

export const logger = createLogger("FrontendApp");