-- ============================================
-- نظام متابعة الجدول الزمني للمشروع
-- Schema: profiles, items (تعريف - PM فقط), item_progress (تنفيذ - مهندس)
-- ============================================

-- الأدوار
create type user_role as enum ('admin', 'engineer');

-- 1) الملفات الشخصية (يُنشأ تلقائيًا عند التسجيل)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'engineer',
  created_at timestamptz not null default now()
);

-- 2) البنود (تعريف الجدول الزمني - يديره PM فقط)
create table items (
  id bigint generated always as identity primary key,
  phase text not null check (phase in ('foundations_only','foundations_basement','basement_only')),
  order_no int not null,
  name text not null,
  planned_start_date date,
  duration_days int,
  planned_end_date date generated always as (planned_start_date + duration_days) stored,
  total_qty numeric,
  unit text,
  assigned_to uuid references profiles(id) on delete set null,
  notes_admin text,
  created_at timestamptz not null default now(),
  unique(phase, order_no)
);

-- 3) التنفيذ (يحدّثه المهندس المسؤول عن البند)
create table item_progress (
  item_id bigint primary key references items(id) on delete cascade,
  actual_start_date date,
  completed_qty numeric default 0,
  notes text,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- ============================================
-- View: نسبة الانجاز والحالة محسوبة تلقائيًا
-- ============================================
create view v_items_full as
select
  i.id, i.phase, i.order_no, i.name,
  i.planned_start_date, i.duration_days, i.planned_end_date,
  i.total_qty, i.unit, i.assigned_to,
  p.full_name as assigned_to_name,
  ip.actual_start_date, ip.completed_qty, ip.notes,
  case when i.total_qty is null or i.total_qty = 0 then null
       else round((coalesce(ip.completed_qty,0) / i.total_qty) * 100, 1)
  end as percent_complete,
  case
    when i.total_qty is null or i.total_qty = 0 then 'غير محدد'
    when coalesce(ip.completed_qty,0) >= i.total_qty then 'مكتمل'
    when coalesce(ip.completed_qty,0) > 0 then 'قيد التنفيذ'
    else 'لم يبدأ'
  end as status,
  ip.updated_at
from items i
left join item_progress ip on ip.item_id = i.id
left join profiles p on p.id = i.assigned_to;

-- ============================================
-- Trigger: عند إنشاء مستخدم جديد -> أنشئ profile
-- ============================================
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'engineer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- عند إضافة بند جديد -> أنشئ صف progress فارغ تلقائيًا
create function handle_new_item() returns trigger as $$
begin
  insert into item_progress (item_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_item_created
  after insert on items
  for each row execute procedure handle_new_item();

-- ============================================
-- Row Level Security
-- ============================================
alter table profiles enable row level security;
alter table items enable row level security;
alter table item_progress enable row level security;

-- profiles: الكل يشوف الكل (لعرض الأسماء بالتوزيع)، كل واحد يعدل نفسه، الأدمن يعدل الكل
create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- items: الكل يشوف، الأدمن بس يعدّل/يضيف/يحذف
create policy "items_select_all" on items for select using (auth.role() = 'authenticated');
create policy "items_admin_write" on items for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- item_progress: الكل يشوف، المهندس المسؤول يعدّل بنوده بس، الأدمن يعدّل الكل
create policy "progress_select_all" on item_progress for select using (auth.role() = 'authenticated');
create policy "progress_engineer_update" on item_progress for update using (
  exists (select 1 from items where items.id = item_progress.item_id and items.assigned_to = auth.uid())
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "progress_admin_insert" on item_progress for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
