-- Fix sequence for mis_user_group table
-- This resets the sequence to the next available ID value

SELECT setval('mis_user_group_id_seq', COALESCE((SELECT MAX(id) FROM mis_user_group), 1), true);

