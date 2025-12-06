-- Add nuget_package_id column to Projects table for displaying NuGet package info
ALTER TABLE Projects ADD COLUMN nuget_package_id TEXT;

