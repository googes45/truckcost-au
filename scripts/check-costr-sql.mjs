import fs from 'node:fs';
import assert from 'node:assert/strict';

const sql = fs.readFileSync(new URL('../supabase/migrations-proposed/20261109_costr_tenant_model.sql', import.meta.url), 'utf8').toLowerCase();
for (const table of ['organisations', 'memberships', 'assets', 'jobs']) {
  assert.match(sql, new RegExp('create table if not exists costr\\.' + table + '\\b'), 'missing table: ' + table);
  assert.match(sql, new RegExp('alter table costr\\.' + table + ' enable row level security'), 'missing RLS: ' + table);
}
for (const policy of ['org_member_select', 'membership_self_select', 'asset_member_select', 'asset_editor_insert', 'asset_editor_update', 'job_member_select', 'job_editor_insert', 'job_editor_update']) {
  assert.ok(sql.includes('create policy ' + policy), 'missing policy: ' + policy);
}
assert.ok(sql.includes('foreign key (asset_id, organisation_id)'), 'cross-tenant asset/job foreign key required');
assert.ok(sql.includes("set search_path = ''"), 'security definer search path must be restricted');
assert.ok(sql.includes('revoke all on function costr.is_member(uuid) from public'), 'function public permissions must be revoked');
assert.ok(!/grant\s+all\s+on\s+.*\s+to\s+(anon|public)/.test(sql), 'unsafe broad grants');
console.log('COSTR proposed schema static security checks passed (not a substitute for database RLS integration tests)');
