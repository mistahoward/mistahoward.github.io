-- Migration: Refactor pets table schema
-- Remove weight column, add description column, rename rescue_story to origin_story, add dex_id

-- Add description column
ALTER TABLE Pets ADD COLUMN description TEXT;

-- Add dex_id column
ALTER TABLE Pets ADD COLUMN dex_id TEXT;

-- Rename rescue_story to origin_story
ALTER TABLE Pets RENAME COLUMN rescue_story TO origin_story;

-- Remove weight column (SQLite doesn't support DROP COLUMN directly, so we'll recreate the table)
-- First, create a temporary table with the new schema
CREATE TABLE Pets_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age INTEGER,
    color TEXT,
    personality TEXT,
    special_abilities TEXT,
    favorite_food TEXT,
    favorite_toy TEXT,
    origin_story TEXT,
    description TEXT,
    dex_id TEXT,
    image_url TEXT,
    icon_url TEXT,
    stats TEXT,
    nickname TEXT,
    adopted_date TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table (excluding weight column)
INSERT INTO Pets_new (
    id, name, species, breed, age, color, personality, special_abilities,
    favorite_food, favorite_toy, origin_story, description, dex_id, image_url, icon_url,
    stats, nickname, adopted_date, is_active, created_at, updated_at
)
SELECT 
    id, name, species, breed, age, color, personality, special_abilities,
    favorite_food, favorite_toy, origin_story, NULL, NULL, image_url, icon_url,
    stats, nickname, adopted_date, is_active, created_at, updated_at
FROM Pets;

-- Drop the old table
DROP TABLE Pets;

-- Rename the new table to Pets
ALTER TABLE Pets_new RENAME TO Pets; 