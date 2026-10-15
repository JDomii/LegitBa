-- Run this ONCE in the Supabase SQL Editor.
-- Adds the "Fake" and "Stamped" verdicts used by the review queue.
-- If you create a brand-new database from schema.sql instead, change its
-- report_status enum to:
--   create type report_status as enum ('reported', 'under_review', 'resolved', 'fake', 'stamped');
alter type report_status add value if not exists 'fake';
alter type report_status add value if not exists 'stamped';
