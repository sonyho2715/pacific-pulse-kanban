-- Migration: Update ProjectStatus enum from 5 statuses to 10 detailed workflow stages
-- This migration safely renames and adds enum values

-- Step 1: Rename existing enum values to their new equivalents
ALTER TYPE "ProjectStatus" RENAME VALUE 'PLANNING' TO 'PLANNED';
-- STARTED and IN_PROGRESS both map to IN_DEVELOPMENT, so we'll migrate data first
ALTER TYPE "ProjectStatus" RENAME VALUE 'FINISHED' TO 'DEPLOYED';
ALTER TYPE "ProjectStatus" RENAME VALUE 'PAID' TO 'COMPLETE';

-- Step 2: Migrate STARTED and IN_PROGRESS to IN_DEVELOPMENT before renaming
-- First, add the IN_DEVELOPMENT value
ALTER TYPE "ProjectStatus" ADD VALUE 'IN_DEVELOPMENT';
UPDATE "Project" SET status = 'IN_DEVELOPMENT' WHERE status = 'STARTED' OR status = 'IN_PROGRESS';

-- Step 3: Add remaining new enum values
ALTER TYPE "ProjectStatus" ADD VALUE 'BACKLOG';
ALTER TYPE "ProjectStatus" ADD VALUE 'CODE_REVIEW';
ALTER TYPE "ProjectStatus" ADD VALUE 'QA';
ALTER TYPE "ProjectStatus" ADD VALUE 'READY_FOR_PROD';
ALTER TYPE "ProjectStatus" ADD VALUE 'MONITORING';
ALTER TYPE "ProjectStatus" ADD VALUE 'CLIENT_DELIVERY';

-- Note: Old STARTED and IN_PROGRESS values will remain in the enum type
-- but won't be used. This is the safest approach in PostgreSQL.
