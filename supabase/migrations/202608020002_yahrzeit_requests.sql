-- Congregant self-service yahrzeit requests: public form submissions land as
-- 'pending' rows that admins approve/reject from the existing iluy-neshama
-- admin page, instead of only being creatable by an editor.
alter table public.iluy_neshama
  add column if not exists status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  add column if not exists submitter_contact text;

drop policy if exists "Public read iluy neshama" on public.iluy_neshama;
create policy "Public read approved iluy neshama" on public.iluy_neshama for select using (status = 'approved');

-- Anyone who knows a synagogue's board_key can submit a request; it stays
-- invisible on the public board (and to other visitors) until an editor
-- approves it via the "Editors manage iluy neshama" policy.
create policy "Public submit yahrzeit request" on public.iluy_neshama for insert with check (status = 'pending');
