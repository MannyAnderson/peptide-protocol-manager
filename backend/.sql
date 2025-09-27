| table_name     | column_name          | data_type                | column_default    | is_nullable |
| -------------- | -------------------- | ------------------------ | ----------------- | ----------- |
| daily_tracking | id                   | uuid                     | gen_random_uuid() | NO          |
| daily_tracking | user_id              | uuid                     | auth.uid()        | NO          |
| daily_tracking | date                 | date                     | CURRENT_DATE      | NO          |
| daily_tracking | peptide_1_id         | uuid                     | null              | YES         |
| daily_tracking | peptide_2_id         | uuid                     | null              | YES         |
| daily_tracking | peptide_3_id         | uuid                     | null              | YES         |
| daily_tracking | weight_lbs           | numeric                  | null              | YES         |
| daily_tracking | waist_in             | numeric                  | null              | YES         |
| daily_tracking | bp_am                | text                     | null              | YES         |
| daily_tracking | bp_pm                | text                     | null              | YES         |
| daily_tracking | body_fat_percent     | numeric                  | null              | YES         |
| daily_tracking | muscle_mass_percent  | numeric                  | null              | YES         |
| daily_tracking | resting_hr           | numeric                  | null              | YES         |
| daily_tracking | energy_level         | integer                  | null              | YES         |
| daily_tracking | appetite_control     | integer                  | null              | YES         |
| daily_tracking | physical_performance | integer                  | null              | YES         |
| daily_tracking | notes                | text                     | ''::text          | YES         |
| daily_tracking | created_at           | timestamp with time zone | now()             | YES         |
| insights       | id                   | uuid                     | gen_random_uuid() | NO          |
| insights       | user_id              | uuid                     | auth.uid()        | NO          |
| insights       | source_type          | text                     | null              | NO          |
| insights       | source_id            | uuid                     | null              | YES         |
| insights       | content              | text                     | null              | NO          |
| insights       | created_at           | timestamp with time zone | now()             | YES         |
| peptide_stacks | id                   | uuid                     | gen_random_uuid() | NO          |
| peptide_stacks | user_id              | uuid                     | auth.uid()        | NO          |
| peptide_stacks | name                 | text                     | null              | NO          |
| peptide_stacks | peptide_ids          | ARRAY                    | '{}'::uuid[]      | NO          |
| peptide_stacks | description          | text                     | ''::text          | YES         |
| peptide_stacks | created_at           | timestamp with time zone | now()             | YES         |
| peptides       | id                   | uuid                     | gen_random_uuid() | NO          |
| peptides       | user_id              | uuid                     | auth.uid()        | NO          |
| peptides       | name                 | text                     | null              | NO          |
| peptides       | concentration_mg     | numeric                  | null              | YES         |
| peptides       | half_life_hr         | numeric                  | null              | YES         |
| peptides       | vial_size_mg         | numeric                  | null              | YES         |
| peptides       | units_remaining      | numeric                  | 0                 | YES         |
| peptides       | manufacturer         | text                     | ''::text          | YES         |
| peptides       | expires_on           | date                     | null              | YES         |
| peptides       | added_on             | timestamp with time zone | now()             | YES         |