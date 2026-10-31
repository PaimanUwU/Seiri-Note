use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskItem {
    pub id: String,
    pub text: String,
    pub subtext: String,
    pub completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub summary: String,
    pub category: String, // "Project" | "Area" | "Resource" | "Archive"
    pub status: String,
    pub tags: Vec<String>,
    pub due_date: String,
    pub priority: String,
    pub area_link: String,
    pub modified: String,
    pub starred: bool,
    pub content: String,
    pub code_snippet: String,
    pub tasks: Vec<TaskItem>,
}

fn vault_file_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app_data_dir: {}", e))?;
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create vault dir: {}", e))?;
    Ok(dir.join("para_vault.json"))
}

#[tauri::command]
fn load_vault(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = vault_file_path(&app)?;
    if path.exists() {
        let data = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read vault file: {}", e))?;
        Ok(Some(data))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn save_vault(app: tauri::AppHandle, payload: String) -> Result<String, String> {
    let path = vault_file_path(&app)?;
    fs::write(&path, payload).map_err(|e| format!("Failed to write vault file: {}", e))?;
    Ok(path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_vault, save_vault])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
